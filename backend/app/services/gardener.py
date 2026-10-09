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


# ─── Public API ───────────────────────────────────────────────────

async def process_brain_dump(request: BrainDumpRequest) -> ProcessResponse:
    """
    Process a raw brain dump into structured thought.

    Currently uses mock logic. To enable real LLM processing:
    - Set LLM_PROVIDER="openai" in .env
    - Set LLM_API_KEY to your key
    """

    start = time.time()

    if settings.LLM_PROVIDER == "mock":
        thought = _mock_process(request.content)
    else:
        # Future: real LLM integration goes here
        # from app.services.llm_client import process_with_llm
        # thought = await process_with_llm(request.content)
        thought = _mock_process(request.content)

    elapsed_ms = (time.time() - start) * 1000

    return ProcessResponse(
        success=True,
        thought=thought,
        processing_time_ms=round(elapsed_ms, 2),
    )
