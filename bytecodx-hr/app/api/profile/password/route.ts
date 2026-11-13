import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, hashPassword, logAudit, setSessionCookie, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";

const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(12).max(128),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = passwordSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid password request." }, { status: 400 });

  const account = db.prepare("SELECT password_hash FROM users WHERE id = ? AND status = 'active'").get(user.id) as { password_hash: string } | undefined;
  if (!account || !verifyPassword(parsed.data.currentPassword, account.password_hash)) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }
  if (verifyPassword(parsed.data.newPassword, account.password_hash)) {
    return NextResponse.json({ error: "Choose a password different from your current password." }, { status: 400 });
  }

  db.prepare("UPDATE users SET password_hash = ?, session_version = session_version + 1 WHERE id = ?")
    .run(hashPassword(parsed.data.newPassword), user.id);
  logAudit("password.changed", user.id, "user", user.id);
  await setSessionCookie(user.id);
  return NextResponse.json({ success: true });
}
