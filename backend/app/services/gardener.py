"""
The Gardener Service
====================
The AI "Gardener" that processes raw brain dumps into structured thoughts.

Currently uses mock responses. When you're ready to plug in a real LLM:
1. Set LLM_PROVIDER and LLM_API_KEY in your .env
2. Replace the mock logic in `process_brain_dump` with actual LLM calls
3. The interface (input/output schemas) stays the same — no frontend changes needed
"""

import time
import random
from app.models.schemas import BrainDumpRequest, ProcessedThought, ProcessResponse
from app.core.config import settings


# ─── Mock Processing (no API key needed) ─────────────────────────

# Simulated AI responses for development
MOCK_CATEGORIES = ["Coding", "Fitness", "Philosophy", "Business", "Personal", "Learning", "Health", "Creative"]

MOCK_TAGS_POOL = {
    "Coding": ["programming", "software", "tech", "development", "debugging"],
    "Fitness": ["exercise", "health", "workout", "nutrition", "habit"],
    "Philosophy": ["reflection", "mindset", "stoicism", "existential", "meaning"],
    "Business": ["startup", "strategy", "growth", "finance", "networking"],
    "Personal": ["life", "relationships", "goals", "self-improvement", "journal"],
    "Learning": ["study", "reading", "courses", "knowledge", "skill"],
    "Health": ["wellness", "sleep", "mental-health", "diet", "recovery"],
    "Creative": ["writing", "art", "music", "design", "brainstorm"],
}


def _mock_process(content: str) -> ProcessedThought:
    """Generate a realistic-looking structured response without any LLM."""

    # Pick a category based on simple keyword matching
    content_lower = content.lower()
    category = "Personal"  # default

    keyword_map = {
        "Coding": ["code", "program", "bug", "rust", "python", "javascript", "api", "function", "deploy", "git"],
        "Fitness": ["gym", "workout", "run", "exercise", "lift", "muscle", "cardio", "training"],
        "Philosophy": ["think", "meaning", "life", "philosophy", "purpose", "reflect", "consciousness"],
        "Business": ["business", "startup", "money", "invest", "market", "client", "revenue"],
        "Learning": ["learn", "study", "read", "book", "course", "university", "class"],
        "Health": ["health", "sleep", "doctor", "dentist", "diet", "mental", "anxiety"],
        "Creative": ["write", "design", "draw", "music", "art", "create", "story"],
    }

    for cat, keywords in keyword_map.items():
        if any(kw in content_lower for kw in keywords):
            category = cat
            break

    # Generate tags
    available_tags = MOCK_TAGS_POOL.get(category, ["general", "note"])
    tags = random.sample(available_tags, min(3, len(available_tags)))

    # Extract simple action items (lines starting with "need to", "should", "must", "remember to")
    action_items = []
    for sentence in content.replace(".", "\n").split("\n"):
        sentence = sentence.strip()
        for trigger in ["need to", "should", "must", "remember to", "have to", "want to"]:
            if trigger in sentence.lower() and len(sentence) > 10:
                action_items.append(sentence.strip())
                break

    # Build title from first meaningful chunk
    words = content.split()
    title = " ".join(words[:8]).rstrip(".,!?") + ("..." if len(words) > 8 else "")

    # Build summary
    summary = content.strip()
    if len(summary) > 200:
        summary = summary[:197] + "..."

    return ProcessedThought(
        title=title,
        summary=summary,
        tags=tags,
        category=category,
        action_items=action_items[:5],  # cap at 5
        connections=[f"Related to your {category} notes"],
    )


import httpx
import json

async def _process_with_gemini(content: str) -> ProcessedThought:
    """Generate structured thought using Gemini Pro REST API."""
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set.")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL}:generateContent?key={api_key}"

    prompt = f"""You are an AI "Gardener" for a personal Second Brain app.
The user will provide a raw, unstructured "brain dump". Your job is to extract meaning, categorize it, and find action items.

You MUST respond with a raw JSON object and nothing else. Do not use Markdown code blocks (e.g. ```json). Just the raw JSON object.

The JSON schema must be exactly this:
{{
  "title": "A short, catchy title (max 6 words)",
  "summary": "A 1-2 sentence summary of the main point",
  "tags": ["array", "of", "up", "to", "4", "relevant", "tags"],
  "category": "One overarching category (e.g. Coding, Fitness, Philosophy, Work, Personal, etc)",
  "action_items": ["Array of extracted action items", "Or empty if none"],
  "connections": ["1 or 2 ideas on how this thought might connect to other concepts"]
}}

Here is the user's brain dump:
"{content}"
"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
        }
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, timeout=30.0)
        response.raise_for_status()
        
        data = response.json()
        try:
            text_response = data["candidates"][0]["content"]["parts"][0]["text"]
            # Clean up potential markdown formatting
            text_response = text_response.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(text_response)
            return ProcessedThought(**parsed)
        except (KeyError, json.JSONDecodeError) as e:
            # Fallback to mock if parsing fails wildly
            print(f"Gemini processing error: {e}")
            return _mock_process(content)

# ─── Public API ───────────────────────────────────────────────────

async def process_brain_dump(request: BrainDumpRequest) -> ProcessResponse:
    """
    Process a raw brain dump into structured thought.
    """
    start = time.time()

    if settings.LLM_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
        try:
            thought = await _process_with_gemini(request.content)
        except Exception as e:
            print(f"Error calling Gemini: {e}")
            thought = _mock_process(request.content)
    else:
        thought = _mock_process(request.content)

    elapsed_ms = (time.time() - start) * 1000

    return ProcessResponse(
        success=True,
        thought=thought,
        processing_time_ms=round(elapsed_ms, 2),
    )
