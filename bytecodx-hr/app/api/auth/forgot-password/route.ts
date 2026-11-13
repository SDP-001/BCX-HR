import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/auth";
import { getMailSettings, sendPasswordResetEmail } from "@/lib/mail";

const requestSchema = z.object({ email: z.string().trim().email().max(254) });
const genericResponse = { success: true, message: "If an active account matches that email, password recovery instructions will be sent." };

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  if (process.env.NODE_ENV === "production") {
    try {
      if (!getMailSettings() || !process.env.APP_BASE_URL) throw new Error("Password recovery email is not configured.");
      const baseUrl = new URL(process.env.APP_BASE_URL);
      if (baseUrl.protocol !== "https:") throw new Error("APP_BASE_URL must use HTTPS in production.");
    } catch (error) {
      console.error("Password recovery configuration error", error);
      return NextResponse.json({ error: "Password recovery is temporarily unavailable. Contact your administrator." }, { status: 503 });
    }
  }

  const email = parsed.data.email.toLowerCase();
  const user = db.prepare(`
    SELECT u.id, u.name, u.email, r.name AS role
    FROM users u JOIN roles r ON r.id = u.role_id
    WHERE u.status = 'active' AND (
      lower(u.email) = ? OR EXISTS (
        SELECT 1 FROM user_login_aliases a WHERE a.user_id = u.id AND lower(a.alias) = ?
      )
    )
  `).get(email, email) as { id: number; name: string; email: string; role: string } | undefined;
  if (!user) return NextResponse.json(genericResponse);

  const recentRequest = db.prepare(`
    SELECT id FROM password_reset_events
    WHERE user_id = ? AND request_time >= datetime('now', '-60 seconds')
    LIMIT 1
  `).get(user.id);
  if (recentRequest) return NextResponse.json(genericResponse);

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const ip = request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const eventId = db.transaction(() => {
    db.prepare(`
      UPDATE password_reset_events SET reset_status = 'superseded'
      WHERE user_id = ? AND reset_status = 'requested'
    `).run(user.id);
    const result = db.prepare(`
      INSERT INTO password_reset_events (user_id, email, token_hash, expires_at)
      VALUES (?, ?, ?, datetime('now', '+30 minutes'))
    `).run(user.id, user.email, tokenHash);
    const id = Number(result.lastInsertRowid);
    const requestedAt = new Date().toISOString();
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      SELECT u.id, 'Password reset requested', ?, 'security'
      FROM users u JOIN roles r ON r.id = u.role_id
      WHERE r.name = 'CEO' AND u.status = 'active'
    `).run(`Name: ${user.name} | Email: ${user.email} | Role: ${user.role} | IP: ${ip} | Time: ${requestedAt} | Status: requested`);
    logAudit("password_reset.requested", user.id, "password_reset", id, `Role: ${user.role} | IP: ${ip} | Status: requested`);
    return id;
  })();

  const baseUrl = process.env.APP_BASE_URL ?? new URL(request.url).origin;
  const resetUrl = new URL(`/reset-password?token=${encodeURIComponent(token)}`, baseUrl).toString();
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.json({ ...genericResponse, resetUrl, eventId });
  }

  try {
    await sendPasswordResetEmail(user.email, user.name, resetUrl);
  } catch (error) {
    db.prepare("UPDATE password_reset_events SET reset_status = 'email_failed' WHERE id = ?").run(eventId);
    logAudit("password_reset.email_failed", user.id, "password_reset", eventId);
    console.error("Password recovery email delivery failed", error);
    return NextResponse.json({ error: "We could not send recovery email. Please try again later or contact your administrator." }, { status: 503 });
  }
  return NextResponse.json(genericResponse);
}
