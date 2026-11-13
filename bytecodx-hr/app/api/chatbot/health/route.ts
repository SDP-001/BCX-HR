import { NextResponse } from "next/server";

const CHATBOT_BACKEND_URL =
  process.env.CHATBOT_BACKEND_URL ||
  process.env.NEXT_PUBLIC_CHATBOT_API_URL ||
  "http://127.0.0.1:8000";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${CHATBOT_BACKEND_URL}/health`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json(
        { status: "offline", message: "FastAPI server responded with error" },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      status: "online",
      backend: CHATBOT_BACKEND_URL,
      ...data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "offline",
        message: "FastAPI chatbot backend is not reachable. Ensure 'uvicorn main:app --reload' is running.",
        error: error instanceof Error ? error.message : "Connection failed",
      },
      { status: 503 }
    );
  }
}
