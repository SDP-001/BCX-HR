"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  FileText,
  Loader2,
  Maximize2,
  MessageSquare,
  Minimize2,
  Paperclip,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
}

const PROMPT_SUGGESTIONS = [
  "Who are the leaders at ByteCodX?",
  "What HR modules does ByteCodX offer?",
  "How does leave & attendance tracking work?",
  "What careers & job roles are open?",
];

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const [showStatusDetails, setShowStatusDetails] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize session and restore messages
  useEffect(() => {
    let sid = localStorage.getItem("bcx_chat_session_id");
    if (!sid) {
      sid = "bcx_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
      localStorage.setItem("bcx_chat_session_id", sid);
    }
    setSessionId(sid);

    const saved = localStorage.getItem("bcx_chat_messages");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        // ignore parse error
      }
    } else {
      setMessages([
        {
          id: "welcome",
          sender: "bot",
          text: "Hello! 👋 I am your ByteCodX HR AI Assistant. Ask me anything about ByteCodX, HR modules, company leadership, careers, or upload an HR policy PDF to ask questions about it!",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, []);

  // Save messages to local storage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("bcx_chat_messages", JSON.stringify(messages.slice(-30)));
    }
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isSending, isOpen]);

  // Check health of chatbot backend
  const checkHealth = async () => {
    setBackendStatus("checking");
    try {
      const res = await fetch("/api/chatbot/health", { method: "GET" });
      if (res.ok) {
        setBackendStatus("online");
      } else {
        setBackendStatus("offline");
      }
    } catch {
      setBackendStatus("offline");
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkHealth();
    }
  }, [isOpen]);

  const handleSendMessage = async (customPrompt?: string) => {
    const questionText = (customPrompt || input).trim();
    if (!questionText || isSending) return;

    const userMsg: Message = {
      id: "u_" + Date.now(),
      sender: "user",
      text: questionText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chatbot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionText,
          session_id: sessionId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Chatbot service responded with an error.");
      }

      setBackendStatus("online");
      setMessages((prev) => [
        ...prev,
        {
          id: "b_" + Date.now(),
          sender: "bot",
          text: data.answer || "No response received.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (error) {
      setBackendStatus("offline");
      setMessages((prev) => [
        ...prev,
        {
          id: "err_" + Date.now(),
          sender: "bot",
          text: `⚠️ ${error instanceof Error ? error.message : "Unable to reach chatbot service."}\n\nMake sure the BCX-HRchatbot backend is running via \`uvicorn main:app --reload\` on port 8000.`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadStatus("Please select a valid .pdf file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus("PDF file size must be less than 10 MB.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading & extracting PDF knowledge...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("session_id", sessionId);

    try {
      const res = await fetch("/api/chatbot/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Upload failed.");
      }

      setUploadStatus(`Uploaded: ${file.name} (${data.pages || 1} pages, ${data.chunks_added || 0} chunks)`);
      setBackendStatus("online");

      setMessages((prev) => [
        ...prev,
        {
          id: "upload_" + Date.now(),
          sender: "bot",
          text: `📄 **${file.name}** was indexed successfully! You can now ask questions about the contents of this document.`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (error) {
      setUploadStatus(error instanceof Error ? error.message : "Failed to upload PDF");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm("Are you sure you want to clear this conversation?")) return;

    try {
      if (sessionId) {
        await fetch(`/api/chatbot/memory/${encodeURIComponent(sessionId)}`, { method: "DELETE" });
      }
    } catch {
      // ignore
    }

    const initialMsg: Message = {
      id: "welcome_reset",
      sender: "bot",
      text: "Chat cleared! How can I help you today with ByteCodX HR?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([initialMsg]);
    localStorage.removeItem("bcx_chat_messages");
    setUploadStatus(null);
  };

  return (
    <>
      {/* Floating launcher trigger */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex cursor-pointer items-center gap-2 rounded-full border border-cyan-500/30 bg-[#0B0920]/90 px-4 py-2 text-xs font-medium text-cyan-200 shadow-xl shadow-cyan-950/40 backdrop-blur-md transition-all hover:border-cyan-400 hover:scale-105"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span>Chat with BCX-HR AI</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close ByteCodX Chatbot" : "Open ByteCodX Chatbot"}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 text-white shadow-2xl shadow-cyan-500/30 transition-all duration-300 hover:scale-110 hover:shadow-cyan-400/50 active:scale-95"
        >
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-violet-600 to-cyan-400 opacity-40 blur-md transition group-hover:opacity-75" />
          <span className="relative flex items-center justify-center">
            {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
          </span>
        </button>
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="ByteCodX HR AI Chatbot"
          className={`fixed bottom-24 right-4 sm:right-6 z-50 flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#070518]/95 text-white shadow-2xl shadow-black/80 backdrop-blur-2xl transition-all duration-300 ${
            isExpanded
              ? "h-[85vh] w-[95vw] sm:w-[600px] md:w-[700px]"
              : "h-[560px] max-h-[82vh] w-[92vw] sm:w-[410px]"
          }`}
        >
          {/* Header */}
          <div className="relative flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#0F0C29] via-[#1B1440] to-[#0B0920] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 p-0.5 shadow-md">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0A0722]">
                  <Bot className="h-5 w-5 text-cyan-300" />
                </div>
                <span
                  title={backendStatus === "online" ? "FastAPI Online" : "FastAPI Disconnected"}
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0A0722] ${
                    backendStatus === "online"
                      ? "bg-emerald-400"
                      : backendStatus === "checking"
                      ? "bg-amber-400 animate-ping"
                      : "bg-rose-500"
                  }`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm tracking-wide text-white">BCX-HR AI</h3>
                  <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-medium text-cyan-300 border border-cyan-500/20">
                    RAG + LLM
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStatusDetails(!showStatusDetails)}
                  className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-cyan-300 transition"
                >
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      backendStatus === "online" ? "bg-emerald-400" : "bg-rose-400"
                    }`}
                  />
                  <span>
                    {backendStatus === "online"
                      ? "FastAPI Connected"
                      : backendStatus === "checking"
                      ? "Checking..."
                      : "Backend Offline"}
                  </span>
                </button>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={checkHealth}
                title="Refresh connection status"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition"
              >
                <RefreshCw className={`h-4 w-4 ${backendStatus === "checking" ? "animate-spin" : ""}`} />
              </button>
              <button
                type="button"
                onClick={handleClearChat}
                title="Clear conversation"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-rose-400 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Collapse" : "Expand"}
                className="hidden sm:inline-flex rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Diagnostic info banner if offline or clicked */}
          {showStatusDetails && (
            <div className="border-b border-white/10 bg-slate-900/90 p-3 text-xs text-gray-300">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-white">Chatbot Service Status</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-gray-400">
                    FastAPI Endpoint: <code className="text-cyan-300">http://127.0.0.1:8000</code>
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-gray-400">
                    To start backend: <code className="text-violet-300">cd BCX-HRchatbot && uvicorn main:app --reload</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStatusDetails(false)}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Messages Body */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-lg ${
                    msg.sender === "user"
                      ? "rounded-br-none bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-normal"
                      : "rounded-bl-none border border-white/10 bg-white/[0.05] text-gray-100 backdrop-blur-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                </div>
                <span className="mt-1 px-1 text-[10px] text-gray-400">{msg.time}</span>
              </div>
            ))}

            {isSending && (
              <div className="flex items-start gap-2">
                <div className="rounded-2xl rounded-bl-none border border-white/10 bg-white/[0.05] px-4 py-3 shadow-lg">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" />
                    <span
                      className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <span
                      className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts if only 1 message exists */}
          {messages.length <= 1 && (
            <div className="border-t border-white/5 bg-white/[0.02] px-4 py-2.5">
              <p className="mb-2 text-[11px] font-medium text-gray-400">Suggested Questions:</p>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_SUGGESTIONS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    className="rounded-full border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-1 text-left text-[11px] text-cyan-200 transition hover:border-cyan-400 hover:bg-cyan-500/10"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PDF Upload Status Bar */}
          {uploadStatus && (
            <div className="flex items-center justify-between border-t border-white/10 bg-violet-950/40 px-3 py-1.5 text-xs text-violet-200">
              <div className="flex items-center gap-1.5 truncate">
                {isUploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-cyan-400" />
                )}
                <span className="truncate">{uploadStatus}</span>
              </div>
              <button
                type="button"
                onClick={() => setUploadStatus(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {/* Footer Input Area */}
          <div className="border-t border-white/10 bg-[#0B0920] p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* PDF upload trigger */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handlePdfUpload}
                disabled={isUploading || isSending}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isSending}
                title="Upload HR Policy or document PDF"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-gray-400 transition hover:border-cyan-500/40 hover:bg-white/[0.08] hover:text-cyan-300 disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                ) : (
                  <Paperclip className="h-4 w-4" />
                )}
              </button>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about ByteCodX HR, policies, team..."
                disabled={isSending}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-sm text-white placeholder-gray-400 transition focus:border-cyan-400/80 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-cyan-400/50 disabled:opacity-50"
              />

              {/* Submit button */}
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-cyan-400 text-white shadow-md shadow-cyan-900/30 transition hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
