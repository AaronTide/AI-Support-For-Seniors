
import os

from database.db import SessionLocal
from database.models import Memory


USE_CHROMA = os.getenv("USE_CHROMA", "").lower() == "true"

def save_memory(text, category):

    db = SessionLocal()

    memory = Memory(
        memory_text=text,
        category=category
    )

    db.add(memory)

    db.commit()

    db.refresh(memory)

    if USE_CHROMA:
        from services.chroma_service import add_memory

        add_memory(
            memory.id,
            text
        )

    db.close()

def get_relevant_memories(query):
    if not USE_CHROMA:
        return []

    from services.chroma_service import search_memories

    results = search_memories(
        query=query,
        n_results=5
    )

    try:
        return results["documents"][0]
    except:
        return []
