from fastapi import APIRouter
from pydantic import BaseModel
from services.ai_service import ask_ai
from services.program_service import load_programs
from services.memory_service import save_memory


router = APIRouter()


class EligibilityRequest(BaseModel):
    situation: str


@router.post("/eligibility")
def eligibility(req: EligibilityRequest):
    programs = load_programs()
    prompt = f"""
    You are an AI benefits caseworker.

    Available Programs:

    {programs}

    User Situation:

    {req.situation}

    Your job:

    1. Determine which programs may apply
    2. Explain why
    3. Identify missing information
    4. Recommend next actions
    5. Generate a checklist

    Do not provide legal advice.
    Use plain language. Keep it short and to the point.
    """
    response = ask_ai(prompt)

    save_memory(
    f"Eligibility discussion: {req.situation}",
    "eligibility"
    )
    return {
        "response": response
    }
    
