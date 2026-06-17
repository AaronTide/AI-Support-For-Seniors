
from database.db import SessionLocal
from database.models import Memory

from services.chroma_service import add_memory
from services.chroma_service import search_memories

def save_memory(text, category):

    db = SessionLocal()

    memory = Memory(
        memory_text=text,
        category=category
    )

    db.add(memory)

    db.commit()

    db.refresh(memory)

    add_memory(
        memory.id,
        text
    )

    db.close()

def get_relevant_memories(query):

    results = search_memories(
        query=query,
        n_results=5
    )

    try:
        return results["documents"][0]
    except:
        return []
