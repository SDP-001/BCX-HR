import { NextResponse } from "next/server";
import { z } from "zod";
import { logAudit } from "@/lib/auth";
import { db } from "@/lib/db";

const applicationSchema = z.object({
  vacancyId: z.coerce.number().int().positive(),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(30),
  resumeUrl: z.string().trim().max(2000).optional().default("").refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }, "Enter a valid HTTP or HTTPS resume link."),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = applicationSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid application." }, { status: 400 });

  const input = parsed.data;
  const vacancy = db.prepare(`
    SELECT id, title FROM job_vacancies
    WHERE id = ? AND status = 'open'
      AND (application_deadline IS NULL OR application_deadline = '' OR date(application_deadline) >= date('now', 'localtime'))
  `).get(input.vacancyId) as { id: number; title: string } | undefined;
  if (!vacancy) return NextResponse.json({ error: "This position is no longer accepting applications." }, { status: 404 });

  const email = input.email.toLowerCase();
  const recentApplications = db.prepare(`
    SELECT COUNT(*) AS count FROM job_applications
    WHERE lower(email) = ? AND application_date >= datetime('now', '-1 hour')
  `).get(email) as { count: number };
  if (recentApplications.count >= 5) return NextResponse.json({ error: "Too many applications were submitted recently. Please try again later." }, { status: 429 });

  const duplicate = db.prepare("SELECT id FROM job_applications WHERE vacancy_id = ? AND lower(email) = ?").get(input.vacancyId, email);
  if (duplicate) return NextResponse.json({ error: "An application for this position already exists with this email." }, { status: 409 });

  const result = db.prepare(`
    INSERT INTO job_applications (vacancy_id, name, email, phone, resume_url, applied_position)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(input.vacancyId, input.name, email, input.phone, input.resumeUrl || null, vacancy.title);
  const applicationId = Number(result.lastInsertRowid);
  logAudit("application.received", null, "job_application", applicationId);
  return NextResponse.json({ success: true, id: applicationId }, { status: 201 });
}
