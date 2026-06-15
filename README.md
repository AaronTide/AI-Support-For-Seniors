# AI-Support-For-Seniors
SilverBridge is an AI caseworker for older adults. It helps seniors discover support programs they may qualify for, explains eligibility requirements in plain language, remembers their application journey, and guides them step-by-step through accessing critical services.




### Main System Flow

1. **User talks to the AI through voice or text** (e.g., "I'm 72, live alone, and can't afford my utility bills").

2. **FastAPI backend receives the query** and sends it to Gemini to extract structured information about the user's situation (age, income, housing status, etc.).

3. **Rule-based eligibility engine** compares the extracted profile against stored program requirements (saved in SQLite) to determine which benefits the user may qualify for.

4. **Gemini explains the reasoning in plain language**, including why the user may qualify, what information is still missing, and recommended next steps.

5. **The interaction is stored as a memory** in SQLite, and an embedding of the conversation is generated and stored in a vector database (preferably ChromaDB; SQLite can hold metadata and memory records).

6. Later, when the user asks questions like:

   * "What was I supposed to do next?"
   * "What documents do I still need?"
   * "What did the support officer tell me?"

   FastAPI performs **semantic search** on the stored embeddings, retrieves relevant memories, and sends them to Gemini.

7. **Gemini generates a personalized response** using both the user's current question and the retrieved context, effectively acting as an AI caseworker that remembers the user's benefit application journey.

### Tech Stack

* **Frontend:** Simple HTML/JS or React
* **Backend:** FastAPI
* **LLM:** Gemini
* **Memory Storage:** SQLite
* **Vector Search:** ChromaDB
* **Speech-to-Text (optional):** Whisper or Gemini Audio
* **Deployment:** Localhost (for demo)

### Core AI Loop

```text
User Query
    ↓
FastAPI
    ↓
Gemini extracts user situation
    ↓
Eligibility Rules (SQLite)
    ↓
Gemini explains eligibility + next steps
    ↓
Store memory + embedding
    ↓
Future questions
    ↓
Semantic Search (ChromaDB)
    ↓
Gemini + Retrieved Memories
    ↓
Personalized Guidance
```

The key differentiator is that you're not just finding benefits—you are building an **AI caseworker that remembers and guides seniors through the entire support process.**


