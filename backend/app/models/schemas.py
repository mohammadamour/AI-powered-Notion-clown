from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# ─── Request Schemas ──────────────────────────────────────────────

class BrainDumpRequest(BaseModel):
    """Raw text the user dumps into the Omnibox or Daily Log."""

    content: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="The raw text to process",
        examples=["I've been thinking about learning Rust. Also need to remember to call the dentist tomorrow."],
    )
    source: str = Field(
        default="omnibox",
        description="Where this dump came from",
        examples=["omnibox", "daily_log", "quick_capture"],
    )


class DailyLogEntry(BaseModel):
    """A single daily log entry."""

    content: str = Field(..., min_length=1, max_length=50000)
    mood: Optional[str] = Field(
        default=None,
        description="Optional mood emoji",
        examples=["😊", "😐", "😤", "💡"],
    )
    created_at: datetime = Field(default_factory=datetime.now)


# ─── Response Schemas ─────────────────────────────────────────────

class ProcessedThought(BaseModel):
    """Structured output from the AI Gardener after processing a brain dump."""

    title: str = Field(..., description="A concise title for this thought")
    summary: str = Field(..., description="A cleaned-up, polished version of the raw input")
    tags: List[str] = Field(default_factory=list, description="Auto-generated tags")
    category: str = Field(..., description="Suggested Mind Tree branch", examples=["Coding", "Fitness", "Philosophy", "Business", "Personal"])
    action_items: List[str] = Field(default_factory=list, description="Extracted to-do items, if any")
    connections: List[str] = Field(default_factory=list, description="Suggested connections to other topics")


class ProcessResponse(BaseModel):
    """Wrapper response for the brain dump processing endpoint."""

    success: bool = True
    thought: ProcessedThought
    processing_time_ms: float = Field(..., description="How long the AI took to process")


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "healthy"
    app_name: str
    version: str
    llm_provider: str
