import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getCurrentUser, logAudit } from "@/lib/auth";
import { db } from "@/lib/db";

const avatarDirectory = path.join(process.cwd(), "data", "avatars");
const maxAvatarBytes = 4 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.status !== "active") return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }
  const image = formData.get("image");
  if (!(image instanceof File)) return NextResponse.json({ error: "Choose a cropped profile image." }, { status: 400 });
  if (image.size < 12 || image.size > maxAvatarBytes || image.type !== "image/webp") {
    return NextResponse.json({ error: "Profile images must be cropped WebP images no larger than 4 MB." }, { status: 400 });
  }

  const content = Buffer.from(await image.arrayBuffer());
  if (content.toString("ascii", 0, 4) !== "RIFF" || content.toString("ascii", 8, 12) !== "WEBP") {
    return NextResponse.json({ error: "The uploaded file is not a valid WebP image." }, { status: 400 });
  }

  await mkdir(avatarDirectory, { recursive: true });
  await writeFile(path.join(avatarDirectory, `${user.id}.webp`), content);
  const avatarUrl = `/api/profile/avatar/${user.id}`;
  db.prepare("UPDATE employee_profiles SET avatar_url = ? WHERE user_id = ?").run(avatarUrl, user.id);
  logAudit("profile.avatar_updated", user.id, "employee_profile", user.id);
  return NextResponse.json({ success: true, avatarUrl });
}
