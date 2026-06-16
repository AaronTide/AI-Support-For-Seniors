
from database.db import SessionLocal
from database.models import Memory

from services.chroma_service import add_memory


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
