import asyncio
import json

from fastapi import HTTPException, status
from google import genai

from app.core.config import settings
from app.dal.ai_search_repository import AiSearchRepository, ContentData
from app.models.ai_search.ai_search import (
    AiSearchRequest,
    AiSearchResponse,
    QueryHistoryItem,
    SaveContentRequest,
    SavedContentItem,
    SourceCard,
    VerifyContentRequest,
)

_GEMINI_SYSTEM_INSTRUCTION = (
    "You are a rehabilitation and physiotherapy expert. "
    "Given a user query, respond ONLY with a valid JSON object in this exact shape: "
    '{"summary": "<2-3 sentence plain-language answer>", '
    '"sources": [{"title": "<source title>", "url": "<full URL>", '
    '"description": "<1-2 sentence description>", '
    '"content_type": "<one of: Article, Clinical Guideline, Exercise Guide, Video>"}]}. '
    "Return 3-5 real, publicly accessible sources. Do not include any text outside the JSON."
)


class AiSearchServices:
    """Business logic for AI search operations."""

    def __init__(self, repository: AiSearchRepository) -> None:
        self.repository = repository

    async def search(self, request: AiSearchRequest) -> AiSearchResponse:
        """Submit a query to Gemini, persist it, and return structured results.

        Args:
            request: The search request containing query_text, user_id, and user_role.

        Returns:
            An AiSearchResponse with query_id, summary, and source cards.

        Raises:
            HTTPException: 502 if Gemini returns an unparseable response.
        """
        query_id = await self.repository.insert_query(
            request.query_text, request.user_id, request.user_role
        )

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        try:
            response = await asyncio.to_thread(
                client.models.generate_content,
                model="gemini-2.5-flash",
                contents=request.query_text,
                config=genai.types.GenerateContentConfig(
                    system_instruction=_GEMINI_SYSTEM_INSTRUCTION,
                    response_mime_type="application/json",
                ),
            )
            data = json.loads(response.text)
            summary = data["summary"]
            raw_sources = data["sources"]
        except (json.JSONDecodeError, KeyError) as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Gemini returned an unexpected response format",
            ) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Gemini API error: {exc}",
            ) from exc

        verified_flags = await self.repository.get_verified_content_url_flags()
        sources = [
            SourceCard(
                title=s["title"],
                url=s["url"],
                description=s["description"],
                content_type=s["content_type"],
                verified_by_physio=verified_flags.get(s["url"], {}).get("physio", False),
                verified_by_trainer=verified_flags.get(s["url"], {}).get("trainer", False),
            )
            for s in raw_sources
        ]

        return AiSearchResponse(query_id=query_id, summary=summary, sources=sources)

    async def get_query_history(self, user_id: str) -> list[QueryHistoryItem]:
        """Return all past queries for a user.

        Args:
            user_id: The ID of the user.

        Returns:
            A list of QueryHistoryItem instances ordered newest first.
        """
        rows = await self.repository.get_queries_by_user(user_id)
        return [QueryHistoryItem.model_validate(row) for row in rows]

    async def delete_query(self, query_id: int) -> None:
        """Delete a query and all its associated content.

        Args:
            query_id: The ID of the query to delete.
        """
        await self.repository.delete_query_cascade(query_id)

    async def save_content(self, request: SaveContentRequest) -> None:
        """Persist a source card to the user's saved library.

        Reuses an existing content row if one already exists for the same
        URL and query. If the existing row is a verify-only skeleton (empty title),
        backfills it with the real title/text/type. Skips inserting a recommendation
        if one already exists for this user and content.

        Args:
            request: The save request with source details and user context.
        """
        existing_content = await self.repository.get_content_by_url_and_query(
            request.url, request.query_id
        )
        if existing_content:
            content_id = existing_content["content_id"]
            await self.repository.update_content_metadata(
                content_id, request.title, request.content_text, request.content_type
            )
        else:
            content_id = await self.repository.insert_content(
                ContentData(
                    title=request.title,
                    url=request.url,
                    content_text=request.content_text,
                    content_type=request.content_type,
                    query_id=request.query_id,
                )
            )
            flags = await self.repository.get_verification_flags_by_url(request.url)
            if flags["physio"]:
                await self.repository.update_verified_flag(request.url, "PHYSIOTHERAPIST", True)
            if flags["trainer"]:
                await self.repository.update_verified_flag(request.url, "FITNESS_TRAINER", True)

        existing_rec = await self.repository.get_recommendation_by_content_and_user(
            content_id, request.user_id
        )
        if not existing_rec:
            await self.repository.insert_saved_content(
                content_id, request.user_id, request.user_role
            )

    async def get_saved_content(self, user_id: str) -> list[SavedContentItem]:
        """Return all saved content for a user.

        Args:
            user_id: The ID of the user.

        Returns:
            A list of SavedContentItem instances ordered newest first.
        """
        rows = await self.repository.get_saved_content_by_user(user_id)
        return [SavedContentItem.model_validate(row) for row in rows]

    async def unsave_content(self, saving_id: int) -> None:
        """Remove a saved content entry from the user's library.

        Args:
            saving_id: The ID of the saved content entry to remove.
        """
        await self.repository.delete_saved_content(saving_id)

    async def verify_content(self, request: VerifyContentRequest) -> None:
        """Set or clear the verified flag on a content URL for a professional's role.

        Verification is a global quality stamp on the content itself — it does not
        create a personal saved-content entry for the professional.

        Args:
            request: The verify request with url, query_id, user_id, user_role, and verified.

        Raises:
            HTTPException: 403 if the requesting user is not a professional role.
        """
        if request.user_role not in ("PHYSIOTHERAPIST", "FITNESS_TRAINER"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only professionals can verify content.",
            )

        existing_content = await self.repository.get_content_by_url_and_query(
            request.url, request.query_id
        )
        if not existing_content:
            await self.repository.insert_content(
                ContentData(
                    title="",
                    url=request.url,
                    content_text=None,
                    content_type="",
                    query_id=request.query_id,
                )
            )

        await self.repository.update_verified_flag(request.url, request.user_role, request.verified)
