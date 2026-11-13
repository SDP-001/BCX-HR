import { NextResponse } from "next/server";

const CHATBOT_BACKEND_URL =
  process.env.CHATBOT_BACKEND_URL ||
  process.env.NEXT_PUBLIC_CHATBOT_API_URL ||
  "http://127.0.0.1:8000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, session_id } = body;

    if (!question || !session_id) {
      return NextResponse.json(
        { detail: "Question and session ID are required." },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const backendRes = await fetch(`${CHATBOT_BACKEND_URL}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, session_id }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error && error.name === "AbortError"
            ? "Chatbot response timed out."
            : "Chatbot backend is currently unavailable. Please ensure BCX-HRchatbot server is running on http://127.0.0.1:8000.",
      },
      { status: 503 }
    );
  }
}
