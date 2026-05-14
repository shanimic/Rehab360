import datetime

from pydantic import BaseModel


class AiSearchRequest(BaseModel):
    """Request body for submitting an AI search query."""

    query_text: str
    user_id: str
    user_role: str


class SourceCard(BaseModel):
    """A single source returned by Gemini for a search query."""

    title: str
    url: str
    description: str
    content_type: str
    physio_verification_count: int = 0
    trainer_verification_count: int = 0


class AiSearchResponse(BaseModel):
    """Response returned after a successful AI search."""

    query_id: int
    summary: str
    sources: list[SourceCard]


class QueryHistoryItem(BaseModel):
    """A single query history entry for a user."""

    query_id: int
    query_text: str
    query_date: datetime.date


class SaveContentRequest(BaseModel):
    """Request body for saving a source card to a user's library."""

    title: str
    url: str
    content_text: str | None
    content_type: str
    query_id: int
    user_id: str
    user_role: str


class SavedContentItem(BaseModel):
    """A saved content entry returned for a user's saved library."""

    saving_id: int
    content_id: int
    query_id: int
    content_title: str
    source_url: str
    content_text: str | None
    content_type: str
    physio_verification_count: int
    trainer_verification_count: int
    created_at: datetime.date


class VerifyContentRequest(BaseModel):
    """Request body for verifying a source as a professional."""

    url: str
    query_id: int
    user_id: str
    user_role: str
    verified: bool = True
