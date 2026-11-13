import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, logAudit } from "@/lib/auth";

const resetSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/, "This password reset link is invalid or expired."),
  password: z.string().min(12, "Password must be at least 12 characters.").max(128),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = resetSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid password reset request." }, { status: 400 });

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const reset = db.prepare(`
    SELECT e.id, e.user_id, u.name, u.email, r.name AS role
    FROM password_reset_events e
    JOIN users u ON u.id = e.user_id
    JOIN roles r ON r.id = u.role_id
    WHERE e.token_hash = ? AND e.reset_status = 'requested'
      AND e.expires_at > CURRENT_TIMESTAMP AND u.status = 'active'
  `).get(tokenHash) as { id: number; user_id: number; name: string; email: string; role: string } | undefined;
  if (!reset) return NextResponse.json({ error: "This password reset link is invalid or expired." }, { status: 400 });

  const ip = request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const update = db.transaction(() => {
    const result = db.prepare(`
      UPDATE password_reset_events
      SET reset_status = 'completed', reset_time = CURRENT_TIMESTAMP, notified_ceo = 1
      WHERE id = ? AND reset_status = 'requested' AND expires_at > CURRENT_TIMESTAMP
    `).run(reset.id);
    if (result.changes !== 1) return false;
    db.prepare("UPDATE users SET password_hash = ?, session_version = session_version + 1 WHERE id = ?")
      .run(hashPassword(parsed.data.password), reset.user_id);
    db.prepare(`
      UPDATE password_reset_events SET reset_status = 'superseded'
      WHERE user_id = ? AND id != ? AND reset_status = 'requested'
    `).run(reset.user_id, reset.id);
    const resetAt = new Date().toISOString();
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      SELECT u.id, 'Password reset completed', ?, 'security'
      FROM users u JOIN roles r ON r.id = u.role_id
      WHERE r.name = 'CEO' AND u.status = 'active'
    `).run(`Name: ${reset.name} | Email: ${reset.email} | Role: ${reset.role} | IP: ${ip} | Time: ${resetAt} | Status: completed`);
    logAudit("password_reset.completed", reset.user_id, "password_reset", reset.id, `IP: ${ip} | Status: completed`);
    return true;
  });

  if (!update()) return NextResponse.json({ error: "This password reset link has already been used or expired." }, { status: 409 });
  return NextResponse.json({ success: true });
}
