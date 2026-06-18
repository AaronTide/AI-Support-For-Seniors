from fastapi import APIRouter
from pydantic import BaseModel
from services.ai_service import ask_ai
from services.memory_service import save_memory
from services.memory_service import get_relevant_memories
router = APIRouter()

class ChatRequest(BaseModel):
    message: str



@router.post("/chat")
def chat(req: ChatRequest):
    memories = get_relevant_memories(
    req.message
)
    memory_context = "\n".join(memories)
    
    #answer = ask_gemini(req.message)
    prompt = f"""
    You are SilverBridge AI.

    Relevant User Memories:
    {memory_context}

    User Question:
    {req.message}

    Use the memories if they are relevant.
    If not relevant, answer normally.
    """

    answer = ask_ai(prompt)
    
    save_memory(
        req.message,
        "conversation"
      )
    return {
        "response": answer
    }
