import os

import google.generativeai as genai
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


def ask_ai(prompt):
    if GROQ_API_KEY:
        return ask_groq(prompt)

    if GEMINI_API_KEY:
        return ask_gemini(prompt)

    raise RuntimeError(
        "No AI provider configured. Add GROQ_API_KEY or GEMINI_API_KEY to backend/.env."
    )


def ask_groq(prompt):
    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": GROQ_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are SilverBridge AI, a careful benefits navigation "
                        "assistant for older adults. Use plain language. Say "
                        "'may qualify' instead of making guaranteed eligibility "
                        "claims. Do not provide legal or medical decisions."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.3,
            "max_tokens": 700,
        },
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"]


def ask_gemini(prompt):
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    return response.text


def demo_response(prompt):
    prompt_lower = prompt.lower()

    if "available programs" in prompt_lower or "eligibility" in prompt_lower:
        return """
You may want to review these support options:

1. Utility bill assistance
   Why: You mentioned fixed income and help with bills.
   Next step: Call the local benefits office or 211 and ask about utility support.

2. Food assistance
   Why: Seniors with limited income may be eligible for nutrition support.
   Next step: Prepare ID, proof of income, and address information.

3. Senior healthcare or medicine support
   Why: Medical costs were listed as a need.
   Next step: Ask a caseworker about prescription assistance programs.

Missing information: exact monthly income, state, household size, and current benefits.

Checklist:
- Gather photo ID
- Gather proof of income
- Write down monthly bills
- Call 211 or the local senior benefits office
""".strip()

    if "medicine" in prompt_lower or "urgent" in prompt_lower or "no money" in prompt_lower:
        return """
This sounds urgent. You may be able to get same-day help from local support services.

Next steps:
- Call 211 and ask for emergency prescription or medicine assistance.
- Contact your pharmacy and ask about low-cost options.
- If your health is in immediate danger, call emergency services.

I can also remember this as a case note: urgent medicine support needed.
""".strip()

    if "what was i supposed" in prompt_lower or "documents" in prompt_lower:
        return """
Based on your saved case notes, the next step is to gather proof of income and your ID card.

If you spoke with a caseworker, save the deadline here so I can remind you later.
""".strip()

    return """
I can help you understand support options in simple language.

You may be able to ask about food assistance, utility bill support, transportation help, or senior healthcare programs. I will ask a few questions, remember your next steps, and remind you what documents or calls are needed.
""".strip()
