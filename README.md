# ByteCodX HR Platform & BCX-HR AI Chatbot

This repository contains the complete ByteCodX enterprise HR platform and the integrated BCX-HR AI Chatbot.

---

## 📁 Repository Structure

```
HR byte/
├── bytecodx-hr/              # Next.js 16 Web Application (Enterprise HR Portal)
│   ├── app/                  # Next.js App Router (Public site, Dashboard, Portal, API)
│   │   └── api/chatbot/      # API integration routes forwarding to the FastAPI chatbot
│   ├── components/
│   │   └── ChatbotWidget.tsx # Floating AI Chatbot interface integrated into the website
│   └── ...
│
└── BCX-HRchatbot/            # Python FastAPI AI Chatbot Backend (RAG + Ollama)
    ├── main.py               # FastAPI application with /ask, /upload-pdf, /memory, /health
    ├── knowledge.txt         # ByteCodX HR knowledge base for TF-IDF retrieval
    ├── requirements.txt      # Python dependencies
    └── static/index.html     # Standalone chatbot web interface
```

---

## 🚀 Running the Project

### 1. Run the Chatbot Backend (BCX-HRchatbot)

1. Open a terminal in the `BCX-HRchatbot` directory:
   ```bash
   cd BCX-HRchatbot
   ```

2. (Optional) Start Ollama for local LLM generation:
   ```bash
   ollama run qwen2.5:1.5b
   ```

3. Start the FastAPI server on port 8000:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   - API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Standalone Chatbot UI: [http://localhost:8000](http://localhost:8000)

### 2. Run the Next.js Website (bytecodx-hr)

1. Open a second terminal in the `bytecodx-hr` directory:
   ```bash
   cd bytecodx-hr
   ```

2. Start the Next.js development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:6001](http://localhost:6001) in your browser.
   The floating **BCX-HR AI** chatbot icon will appear in the bottom-right corner across all pages, allowing users to:
   - Ask questions about ByteCodX HR policies, executives, careers, and services.
   - Upload PDF documents (e.g. employee handbooks or offer letters) and query them directly.
   - Clear conversation history and toggle full-screen expansion.

---

## 🛠 Features

- **TF-IDF & Cosine Similarity RAG**: Fast contextual search across `knowledge.txt` and in-memory uploaded PDF chunks.
- **Ollama LLM Generation**: Uses local models (e.g., `qwen2.5:1.5b`) for natural, contextual conversational answers.
- **Next.js API Gateway**: Proxies `/api/chatbot/*` requests to the Python backend to avoid CORS restrictions.
- **Floating UI Widget**: Dark-mode cyberpunk styling matching ByteCodX branding, with typing indicator, health status check, and session memory.
