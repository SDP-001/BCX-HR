import { NextResponse } from "next/server";
import { z } from "zod";
import { logAudit } from "@/lib/auth";
import { db } from "@/lib/db";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().min(10).max(4000),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid contact request." }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const recent = db.prepare(`
    SELECT COUNT(*) AS count FROM contact_inquiries
    WHERE lower(email) = ? AND created_at >= datetime('now', '-15 minutes')
  `).get(email) as { count: number };
  if (recent.count >= 3) return NextResponse.json({ error: "Too many messages were submitted recently. Please try again later." }, { status: 429 });

  const result = db.prepare(`
    INSERT INTO contact_inquiries (name, email, company, message)
    VALUES (?, ?, ?, ?)
  `).run(parsed.data.name, email, parsed.data.company || null, parsed.data.message);
  const inquiryId = Number(result.lastInsertRowid);
  db.prepare(`
    INSERT INTO notifications (user_id, title, message, type)
    SELECT u.id, 'New contact inquiry', 'Public inquiry #' || ? || ' is ready for review in Settings & Audit.', 'info'
    FROM users u JOIN roles r ON r.id = u.role_id
    WHERE r.name = 'CEO' AND u.status = 'active'
  `).run(inquiryId);
  logAudit("contact.inquiry_received", null, "contact_inquiry", inquiryId);
  return NextResponse.json({ success: true }, { status: 201 });
}
