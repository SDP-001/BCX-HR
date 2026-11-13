import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export function GET() {
  try {
    db.prepare("SELECT 1").get();
    return NextResponse.json({ status: "operational" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
