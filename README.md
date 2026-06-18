# SilverBridge AI

AI-powered voice-first benefits navigator for older adults.

SilverBridge helps seniors discover support programs they may qualify for, understand eligibility requirements in plain language, remember application progress, and receive step-by-step guidance through complex public support systems.

---

# Problem

Many older adults miss out on critical support services because:

* Eligibility rules are confusing
* Government websites are difficult to navigate
* Instructions are hard to remember
* Follow-up actions are often forgotten
* Many seniors have limited digital literacy

SilverBridge acts as an AI caseworker that guides users through the process and remembers their application journey.

---

# Current Architecture

```text
React Frontend

        ↓

FastAPI Backend

        ↓

Gemini API

        ↓

SQLite Database

        ↓

ChromaDB Semantic Search
```

---

# Current Features

## 1. AI Chat Assistant

Users can send natural language questions to Gemini through the FastAPI backend.

Example:

> I am 72 years old and live alone.

Gemini responds conversationally.

---

## 2. Memory Storage

Important user information can be stored in SQLite.

Example memories:

* User is 72 years old
* User lives alone
* User receives social security
* User must submit proof of income before Friday

API:

```http
POST /memory
```

---

## 3. Memory Retrieval

Stored memories can be viewed.

API:

```http
GET /memories
```

---

## 4. Semantic Search with ChromaDB

Memories are automatically embedded and stored in ChromaDB.

Users can retrieve relevant memories using natural language queries.

Examples:

Query:

> income documents

Result:

> User must submit proof of income before Friday

API:

```http
GET /search?query=income documents
```

---

# Project Structure

```text
backend/

├── main.py
│
├── routes/
│   ├── chat.py
│   └── memory.py
│
├── services/
│   ├── gemini_service.py
│   ├── memory_service.py
│   └── chroma_service.py
│
├── database/
│   ├── db.py
│   └── models.py
│
├── data/
│   └── programs.json
│
├── chroma_db/
│
├── memory.db
│
├── .env
│
└── requirements.txt
```

---

# Tech Stack

Backend:

* FastAPI

LLM:

* Google Gemini

Database:

* SQLite

Vector Database:

* ChromaDB

ORM:

* SQLAlchemy

Environment Variables:

* python-dotenv

---

# Setup Instructions

## 1. Clone Repository

```bash
git clone <repo-url>
cd backend
```

---

## 2. Create Virtual Environment

Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

Mac/Linux:

```bash
python -m venv venv
source venv/bin/activate
```

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

If requirements.txt is missing:

```bash
pip install fastapi
pip install uvicorn
pip install google-generativeai
pip install python-dotenv
pip install sqlalchemy
pip install chromadb
```

---

## 4. Create .env File

Create:

```text
.env
```

Add:

```env
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

---

## 5. Start Backend

```bash
uvicorn main:app --reload
```

Open:

```text
http://127.0.0.1:8000/docs
```

Swagger UI should appear.

---

# Available Endpoints

## Chat

```http
POST /chat
```

Request:

```json
{
  "message": "I am 72 years old and live alone"
}
```

---

## Save Memory

```http
POST /memory
```

Request:

```json
{
  "text":"User is 72 years old",
  "category":"profile"
}
```

---

## Get All Memories

```http
GET /memories
```

---

## Semantic Search

```http
GET /search?query=income documents
```

---

# Development Progress

## Phase 0 - Setup

* [x] FastAPI setup
* [x] Gemini integration

## Phase 1 - Memory System

* [x] SQLite memory storage
* [x] Memory retrieval
* [x] SQLAlchemy models

## Phase 2 - Semantic Search

* [x] ChromaDB integration
* [x] Semantic memory retrieval

---

# Next Tasks

## Phase 3 - AI Memory Recall

Goal:

Allow Gemini to automatically use relevant memories when answering.

Example:

User:

> What should I do next?

System:

1. Search ChromaDB
2. Retrieve relevant memories
3. Inject memories into Gemini prompt
4. Generate personalized response

---

## Phase 4 - Benefits Eligibility Engine

Goal:

Help users understand what support programs they may qualify for.

Implementation:

* Create support program database
* Store eligibility criteria
* Collect user information through conversation
* Match user profile to programs
* Explain eligibility reasoning
* Generate next steps

Example:

> You may qualify for Senior Utility Assistance because you are over 65 and live alone. The only missing information is proof of income.

---

## Phase 5 - Action Checklist Generator

Goal:

Generate personalized task lists.

Example:

Application Checklist:

* [ ] Gather proof of income
* [ ] Gather ID
* [ ] Contact support office
* [ ] Submit application

---

## Phase 6 - Voice Interface

Goal:

Allow seniors to interact using speech instead of typing.

Possible Stack:

* [x] Browser Speech API
* [ ] Whisper
* [ ] Gemini Audio

---

# Frontend Setup

The React frontend lives in `frontend/`.

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

The frontend expects the backend at:

```text
http://127.0.0.1:8000
```

To override this, create `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Frontend features:

* Senior-friendly React demo interface
* Browser voice input when supported
* Text-to-speech AI replies
* Eligibility profile form
* Case memory note saving
* Saved memory display
* Emergency support actions
* Responsible AI disclaimer that final eligibility must be verified

---

# Hackathon Demo Vision

Scenario:

1. User asks what support programs they may qualify for.
2. AI asks clarifying questions.
3. AI determines likely eligibility.
4. AI creates a checklist.
5. AI remembers previous conversations.
6. User returns later and asks:

   > What do I still need to do?
7. AI retrieves memories and provides guidance.

This demonstrates AI reasoning, memory, and support-system navigation rather than acting as a simple directory of resources.
