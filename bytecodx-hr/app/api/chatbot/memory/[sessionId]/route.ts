import { NextResponse } from "next/server";

const CHATBOT_BACKEND_URL =
  process.env.CHATBOT_BACKEND_URL ||
  process.env.NEXT_PUBLIC_CHATBOT_API_URL ||
  "http://127.0.0.1:8000";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;

    if (!sessionId) {
      return NextResponse.json(
        { detail: "Session ID is required." },
        { status: 400 }
      );
    }

    const backendRes = await fetch(
      `${CHATBOT_BACKEND_URL}/memory/${encodeURIComponent(sessionId)}`,
      {
        method: "DELETE",
      }
    );

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Failed to clear chatbot conversation.",
      },
      { status: 503 }
    );
  }
}
