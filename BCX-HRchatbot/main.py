
# ==========================================
# MYCUSTOMLLM - PROFESSIONAL AI CHATBOT
# ==========================================

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pypdf import PdfReader

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from io import BytesIO
import requests


# STEP 1: CREATE FASTAPI APPLICATION

app = FastAPI(
    title="MyCustomLLM API",
    description="My personal AI assistant",
    version="3.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# STEP 2: LOAD CUSTOM KNOWLEDGE

def load_knowledge():

    try:
        with open("knowledge.txt", "r", encoding="utf-8") as file:
            content = file.read()

        return [
            p.strip()
            for p in content.split("\n\n")
            if p.strip()
        ]

    except FileNotFoundError:
        return []


knowledge = load_knowledge()


# STEP 3: STORE CONVERSATION MEMORY AND PDF DATA

conversation_memory = {}

pdf_chunks_by_session = {}


# STEP 4: SEARCH KNOWLEDGE

def search_knowledge(question, session_id):

    documents = (
        knowledge +
        pdf_chunks_by_session.get(session_id, [])
    )

    if not documents:
        return "No custom documents have been uploaded."

    vectorizer = TfidfVectorizer()

    document_vectors = vectorizer.fit_transform(documents)

    question_vector = vectorizer.transform([question])

    scores = cosine_similarity(
        question_vector,
        document_vectors
    )[0]

    best_indices = scores.argsort()[::-1][:3]

    results = []

    for index in best_indices:

        if scores[index] >= 0.05:
            results.append(documents[index])

    if not results:
        return "No relevant custom information found."

    return "\n\n".join(results)


# STEP 5: CONNECT TO OLLAMA

def ask_llm(question, context, history):

    url = "http://localhost:11434/api/chat"

    system_prompt = f"""
    You are BCX-HR AI, the dedicated AI HR assistant for ByteCodX.

    Instructions:

    1. Answer in professional, friendly English.
    2. Give clear and useful explanations about ByteCodX, HR policies, workforce services, careers, and uploaded documents.
    3. Remember the previous conversation.
    4. Use the custom knowledge when relevant.
    5. If custom knowledge does not contain the answer,
       you may use your general knowledge.
    6. Never pretend that information is present in
       an uploaded document when it is not.

    Custom knowledge:

    {context}
    """

    messages = [
        {
            "role": "system",
            "content": system_prompt
        }
    ]

    messages.extend(history)

    messages.append({
        "role": "user",
        "content": question
    })

    data = {
        "model": "qwen2.5:1.5b",
        "messages": messages,
        "stream": False
    }

    response = requests.post(
        url,
        json=data,
        timeout=120
    )

    response.raise_for_status()

    return response.json()["message"]["content"]


# STEP 6: REQUEST FORMAT

class Question(BaseModel):

    question: str
    session_id: str


# STEP 7: HOME ENDPOINT

@app.get("/health")
def health():

    return {
        "message": "MyCustomLLM is running!",
        "status": "success"
    }


# STEP 8: ASK AI ENDPOINT

@app.post("/ask")
def ask_question(data: Question):

    question = data.question.strip()
    session_id = data.session_id.strip()

    if not question or not session_id:
        raise HTTPException(
            status_code=400,
            detail="Question and session ID are required."
        )

    history = conversation_memory.setdefault(
        session_id, []
    )

    try:

        context = search_knowledge(
            question,
            session_id
        )

        answer = ask_llm(
            question,
            context,
            history
        )

        history.extend([
            {
                "role": "user",
                "content": question
            },
            {
                "role": "assistant",
                "content": answer
            }
        ])

        # Keep the last 10 messages
        conversation_memory[session_id] = history[-10:]

        return {
            "question": question,
            "session_id": session_id,
            "answer": answer
        }

    except requests.RequestException:
        if context and context not in ("No custom documents have been uploaded.", "No relevant custom information found."):
            answer = f"Found relevant information in ByteCodX HR knowledge base:\n\n{context}\n\n*(Note: Ollama LLM is currently unreachable at http://localhost:11434. Start Ollama with 'ollama run qwen2.5:1.5b' for conversational AI responses)*"
            history.extend([
                {"role": "user", "content": question},
                {"role": "assistant", "content": answer}
            ])
            conversation_memory[session_id] = history[-10:]
            return {
                "question": question,
                "session_id": session_id,
                "answer": answer
            }

        raise HTTPException(
            status_code=503,
            detail="Could not connect to Ollama. Check whether Ollama is running (e.g. 'ollama run qwen2.5:1.5b')."
        )


# STEP 9: CLEAR CONVERSATION

@app.delete("/memory/{session_id}")
def clear_memory(session_id: str):

    conversation_memory.pop(session_id, None)

    return {
        "message": "Conversation memory cleared!"
    }


# STEP 10: UPLOAD PDF

@app.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    session_id: str = Form(...)
):

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF file."
        )

    file_data = await file.read()

    if len(file_data) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="PDF must be smaller than 10 MB."
        )

    if not file_data.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file."
        )

    try:

        pdf = PdfReader(BytesIO(file_data))

        if len(pdf.pages) > 50:
            raise HTTPException(
                status_code=400,
                detail="PDF must have no more than 50 pages."
            )

        extracted_text = ""

        for page in pdf.pages:
            extracted_text += (page.extract_text() or "") + "\n"

        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No readable text found in this PDF."
            )

        # Create smaller text chunks
        chunks = [
            extracted_text[i:i + 1000].strip()
            for i in range(0, len(extracted_text), 800)
        ]

        chunks = [chunk for chunk in chunks if chunk]

        # Store PDF knowledge separately for each session
        pdf_chunks_by_session.setdefault(
            session_id, []
        ).extend(chunks)

        return {
            "message": "PDF uploaded successfully!",
            "filename": file.filename,
            "pages": len(pdf.pages),
            "chunks_added": len(chunks)
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Unable to read this PDF."
        )


# STEP 11: SERVE CHATBOT WEBSITE
# Keep this at the bottom after all API endpoints.

app.mount(
    "/",
    StaticFiles(directory="static", html=True),
    name="static"
)
