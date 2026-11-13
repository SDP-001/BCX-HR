import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { seedExecutives, setSessionCookie, verifyPassword } from "@/lib/auth";

const loginSchema = z.object({
  emailOrPhone: z.string().min(1, "Email or phone is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  try {
    seedExecutives();
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid login payload." }, { status: 400 });
    }

    const user = db
      .prepare(
        `
          SELECT u.id, u.name, u.email, u.phone, u.password_hash, u.role_id, r.name as role
          FROM users u
          JOIN roles r ON r.id = u.role_id
          WHERE u.status = 'active' AND (lower(u.email) = ? OR u.phone = ?
            OR EXISTS (
              SELECT 1 FROM user_login_aliases a
              WHERE a.user_id = u.id AND lower(a.alias) = ?
            ))
        `
      )
      .get(
        parsed.data.emailOrPhone.trim().toLowerCase(),
        parsed.data.emailOrPhone.trim(),
        parsed.data.emailOrPhone.trim().toLowerCase(),
      ) as
      | { id: number; name: string; email: string; phone: string; password_hash: string; role_id: number; role: string }
      | undefined;

    if (!user || !verifyPassword(parsed.data.password, user.password_hash)) {
      return NextResponse.json({ error: "Invalid email/phone or password." }, { status: 401 });
    }

    db.prepare("UPDATE users SET last_login = ? WHERE id = ?").run(new Date().toISOString(), user.id);
    await setSessionCookie(user.id, parsed.data.rememberMe);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Authentication failed." }, { status: 500 });
  }
}
