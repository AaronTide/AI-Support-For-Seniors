from fastapi import APIRouter
from pydantic import BaseModel
from services.chroma_service import search_memories
from services.memory_service import save_memory

router = APIRouter()


class MemoryRequest(BaseModel):
    text: str
    category: str


@router.post("/memory")
def add_memory(req: MemoryRequest):

    save_memory(
        req.text,
        req.category
    )

    return {
        "message": "memory saved"
    }

from database.db import SessionLocal
from database.models import Memory


@router.get("/memories")
def get_memories():

    db = SessionLocal()

    memories = db.query(Memory).all()

    results = []

    for m in memories:

        results.append({
            "id": m.id,
            "text": m.memory_text,
            "category": m.category
        })

    db.close()

    return results

@router.get("/search")
def search(query: str):

    results = search_memories(query)

    docs = results["documents"][0]

    return {
        "memories": docs
    }
