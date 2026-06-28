"""WeHA AI (OpenRouter-powered chat assistant) endpoints.

Extracted from backend/server.py when the WeHA AI feature was moved out of the
live site. To re-enable, paste this back into server.py (it expects `api_router`,
`db`, `logger`, `httpx`, and the pydantic/typing imports to be available).

NOTE: OpenRouter is wired with PLACEHOLDER credentials. Until a real
OPENROUTER_API_KEY is provided, the endpoint returns a graceful demo response
(mocked=True) so the UI is fully functional.
"""
import os
from datetime import datetime, timezone
from typing import List, Optional

import httpx
from fastapi import HTTPException
from pydantic import BaseModel, Field

# These are provided by server.py when re-integrated:
#   api_router, db, logger

OPENROUTER_BASE_URL = os.environ.get("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL = os.environ.get("OPENROUTER_MODEL", "openai/gpt-4o-mini")
OPENROUTER_SITE_URL = os.environ.get("OPENROUTER_SITE_URL", "https://www.wehelpautomate.com")

# Placeholder model menu shown in the UI dropdown.
WEHA_AI_MODELS = [
    "openai/gpt-4o-mini",
    "openai/gpt-4o",
    "anthropic/claude-3.5-sonnet",
    "google/gemini-flash-1.5",
    "meta-llama/llama-3.1-70b-instruct",
]

WEHA_AI_SYSTEM_PROMPT = (
    "You are WeHA AI, the assistant for 'We Help Automate' (WeHA), a company that builds "
    "compliance-grade AI automation for SMBs across the UAE, Australia and Singapore. "
    "ONLY help with: (1) how AI and automation can be applied in the user's business, "
    "(2) which workflows are good automation candidates, and (3) how WeHA can help. "
    "If a question is clearly off-topic, briefly and politely steer the conversation back to "
    "AI and automation for business. Keep answers concise, practical and jargon-light. "
    "When relevant, suggest booking a free 60-minute AI Audit at wehelpautomate.com/contact."
)


def _openrouter_configured() -> bool:
    key = (OPENROUTER_API_KEY or "").strip()
    return bool(key) and key.lower() not in {"placeholder", "replace_me", "your_key_here"}


def _mock_reply(user_text: str) -> str:
    return (
        "Thanks for the question! (Demo mode — WeHA AI isn't connected to a live model yet.)\n\n"
        "Here's how I'd normally help: I'd look at your most repetitive, time-consuming tasks — "
        "things like lead follow-up, quoting, invoicing or document generation — and point out which "
        "are the best candidates to automate first using tools you likely already have (e.g. n8n, Make, "
        "your CRM and an LLM).\n\n"
        "To get tailored, accurate answers, connect an OpenRouter API key, or book a free 60-minute "
        "AI Audit at wehelpautomate.com/contact and a human will map your top 3 automatable workflows."
    )


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    session_id: str = Field(..., min_length=1)
    messages: List[ChatMessage]
    model: Optional[str] = None


@api_router.get("/weha-ai/models")
async def weha_ai_models():
    return {"models": WEHA_AI_MODELS, "default": OPENROUTER_MODEL}


@api_router.post("/weha-ai/chat")
async def weha_ai_chat(req: ChatRequest):
    if not req.messages:
        raise HTTPException(status_code=422, detail="messages cannot be empty")

    model = req.model if (req.model in WEHA_AI_MODELS) else OPENROUTER_MODEL
    last_user = next((m.content for m in reversed(req.messages) if m.role == "user"), "")

    mocked = False
    if not _openrouter_configured():
        reply = _mock_reply(last_user)
        mocked = True
    else:
        payload = {
            "model": model,
            "messages": [{"role": "system", "content": WEHA_AI_SYSTEM_PROMPT}]
            + [{"role": m.role, "content": m.content} for m in req.messages],
        }
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "HTTP-Referer": OPENROUTER_SITE_URL,
            "X-Title": "WeHA AI",
        }
        try:
            async with httpx.AsyncClient(timeout=60.0) as http_client:
                resp = await http_client.post(
                    f"{OPENROUTER_BASE_URL}/chat/completions", json=payload, headers=headers
                )
                resp.raise_for_status()
                data = resp.json()
                reply = data["choices"][0]["message"]["content"]
        except Exception:  # noqa: BLE001
            logger.exception("OpenRouter request failed")
            reply = (
                "Sorry — I couldn't reach the model right now. Please try again shortly, "
                "or book a free AI Audit at wehelpautomate.com/contact."
            )
            mocked = True

    # Persist the conversation (best-effort).
    try:
        await db.weha_ai_sessions.update_one(
            {"session_id": req.session_id},
            {
                "$set": {"session_id": req.session_id, "model": model, "updated_at": datetime.now(timezone.utc).isoformat()},
                "$push": {
                    "messages": {
                        "$each": [
                            {"role": "user", "content": last_user},
                            {"role": "assistant", "content": reply},
                        ]
                    }
                },
            },
            upsert=True,
        )
    except Exception:  # noqa: BLE001
        logger.exception("Failed to persist weha_ai session")

    return {"reply": reply, "model": model, "mocked": mocked}
