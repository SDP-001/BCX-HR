# BCX-HRchatbot (MyCustomLLM)

A professional AI Chatbot application built with **FastAPI**, **Ollama**, and **Scikit-learn** TF-IDF vector retrieval. It supports custom domain knowledge retrieval, PDF document upload & question answering, and a clean, responsive web chat interface.

## Features

- **Interactive Web Interface**: Floating chat widget with session memory and light/dark mode support.
- **Custom Knowledge Base**: Context-aware retrieval using TF-IDF and cosine similarity from `knowledge.txt`.
- **PDF Upload & Ingestion**: Dynamically extract text chunks from uploaded PDFs for immediate querying.
- **Ollama Integration**: Seamless integration with local LLMs via Ollama (`http://localhost:11434/api/chat`).
- **REST API**: Built with FastAPI for high performance and easy extensibility.

## Tech Stack

- **Backend**: FastAPI, Uvicorn, Requests
- **Machine Learning & NLP**: Scikit-learn (TF-IDF Vectorizer), PyPDF
- **Frontend**: Modern HTML5, CSS3, JavaScript (Vanilla)

## Getting Started

### Prerequisites

- Python 3.10+
- [Ollama](https://ollama.com/) installed and running locally

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Sugasini-647/BCX-HRchatbot.git
   cd BCX-HRchatbot
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS / Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the application**:
   ```bash
   uvicorn main:app --reload
   ```

5. **Open in browser**:
   Navigate to [http://localhost:8000](http://localhost:8000).
