from database.db import SessionLocal
from database.models import Memory


def save_memory(text, category):

    db = SessionLocal()

    memory = Memory(
        memory_text=text,
        category=category
    )

    db.add(memory)

    db.commit()

    db.close()
