import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to view this profile photo." }, { status: 401 });
  const { userId: rawUserId } = await params;
  if (!/^\d+$/.test(rawUserId)) return NextResponse.json({ error: "Profile photo not found." }, { status: 404 });
  const userId = Number(rawUserId);
  if (user.id !== userId && user.role !== "CEO") return NextResponse.json({ error: "You cannot view this profile photo." }, { status: 403 });

  const profile = db.prepare("SELECT avatar_url FROM employee_profiles WHERE user_id = ?").get(userId) as { avatar_url: string | null } | undefined;
  if (!profile?.avatar_url || profile.avatar_url !== `/api/profile/avatar/${userId}`) {
    return NextResponse.json({ error: "Profile photo not found." }, { status: 404 });
  }
  try {
    const image = await readFile(path.join(process.cwd(), "data", "avatars", `${userId}.webp`));
    return new NextResponse(new Uint8Array(image), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return NextResponse.json({ error: "Profile photo not found." }, { status: 404 });
    }
    throw error;
  }
}
