import { NextResponse } from "next/server";

const CHATBOT_BACKEND_URL =
  process.env.CHATBOT_BACKEND_URL ||
  process.env.NEXT_PUBLIC_CHATBOT_API_URL ||
  "http://127.0.0.1:8000";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const sessionId = formData.get("session_id");

    if (!file || !sessionId) {
      return NextResponse.json(
        { detail: "File and session_id are required." },
        { status: 400 }
      );
    }

    const backendFormData = new FormData();
    backendFormData.append("file", file);
    backendFormData.append("session_id", String(sessionId));

    const backendRes = await fetch(`${CHATBOT_BACKEND_URL}/upload-pdf`, {
      method: "POST",
      body: backendFormData,
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Failed to upload PDF to chatbot backend.",
      },
      { status: 503 }
    );
  }
}
