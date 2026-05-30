import asyncio
import json
import re

import httpx

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

_VERTEX_REDIRECT_PREFIX = "vertexaisearch.cloud.google.com/grounding-api-redirect/"

_GEMINI_SYSTEM_INSTRUCTION_TEMPLATE = (
    "You are a rehabilitation and physiotherapy expert. "
    "Use Google Search to find current, accessible sources. "
    "Prefer authoritative medical domains (e.g. pubmed, NHS, Mayo Clinic, Physio-Pedia, Cochrane). "
    "Respond ONLY with valid JSON in this exact shape — no markdown, no extra text: "
    '{{"summary": "<2-3 sentence answer>", '
    '"sources": [{{"title": "<title>", '
    '"url": "<exact url of this source>", '
    '"description": "<1-2 sentence description>", '
    '"content_type": "<Article|Clinical Guideline|Exercise Guide|Video>"}}]}}. '
    "You MUST return exactly {max_sources} sources."
)


def _build_system_instruction(max_sources: str) -> str:
    """Inject the source count into the system instruction template."""
    return _GEMINI_SYSTEM_INSTRUCTION_TEMPLATE.format(max_sources=max_sources)


async def _build_raw_sources(json_sources: list[dict]) -> list[dict]:
    """Pair each source dict with its redirect-resolved URL.

    Args:
        json_sources: Source dicts from Gemini JSON, each containing a "url" key.

    Returns:
        Source dicts with "url" replaced by the fully resolved destination URL.
    """
    resolved_urls = await _resolve_grounding_urls(
        [s.get("url", "") for s in json_sources]
    )
    return [
        {**src, "url": resolved_url}
        for src, resolved_url in zip(json_sources, resolved_urls)
        if resolved_url
    ]


async def _resolve_url(client: httpx.AsyncClient, url: str) -> str:
    """Follow a Vertex AI redirect to its final destination URL.

    Non-redirect URLs pass through unchanged. Any network or timeout
    error falls back to the original URL so the search flow is never broken.

    Args:
        client: A shared AsyncClient configured with follow_redirects=True.
        url: The candidate URL from Gemini grounding metadata.

    Returns:
        The resolved destination URL, or the original URL on any failure.
    """
    if _VERTEX_REDIRECT_PREFIX not in url:
        return url
    try:
        response = await client.head(url, timeout=3.0)
        resolved = str(response.url)
        if _VERTEX_REDIRECT_PREFIX in resolved:
            return ""
        return resolved
    except httpx.HTTPError:
        return ""


async def _resolve_grounding_urls(urls: list[str]) -> list[str]:
    """Resolve all grounding URLs in parallel, following Vertex AI redirects.

    Args:
        urls: Candidate URLs from Gemini grounding metadata.

    Returns:
        Resolved URLs in the same order as the input.
    """
    async with httpx.AsyncClient(follow_redirects=True) as client:
        tasks = [_resolve_url(client, url) for url in urls]
        return list(await asyncio.gather(*tasks))


def _parse_gemini_response(text: str) -> dict:
    """Extract and parse the JSON object from a Gemini response string."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0].strip()
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise json.JSONDecodeError("No JSON object found", text, 0)
    return json.loads(match.group())



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
            contents: list[genai.types.Content] = []
            for exchange in request.conversation_history or []:
                contents.append(
                    genai.types.Content(
                        role="user", parts=[genai.types.Part(text=exchange.query)]
                    )
                )
                contents.append(
                    genai.types.Content(
                        role="model", parts=[genai.types.Part(text=exchange.answer)]
                    )
                )
            contents.append(
                genai.types.Content(
                    role="user", parts=[genai.types.Part(text=request.query_text)]
                )
            )
            max_sources = "3" if request.search_mode == "instant" else "10"
            response = await asyncio.to_thread(
                client.models.generate_content,
                model="gemini-2.5-flash",
                contents=contents,
                config=genai.types.GenerateContentConfig(
                    system_instruction=_build_system_instruction(max_sources),
                    tools=[genai.types.Tool(google_search=genai.types.GoogleSearch())],
                ),
            )
            data = _parse_gemini_response(response.text or "")
            summary = data["summary"]
            raw_sources = await _build_raw_sources(data.get("sources", []))
        except (json.JSONDecodeError, KeyError) as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Gemini returned an unexpected response format",
            ) from exc
        except Exception as exc:
            exc_str = str(exc)
            if "UNAVAILABLE" in exc_str or "503" in exc_str:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="The AI service is temporarily busy. Please try again in a moment.",
                ) from exc
            if "RESOURCE_EXHAUSTED" in exc_str or "429" in exc_str:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="AI search quota exceeded. Please try again tomorrow.",
                ) from exc
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Gemini API error: {exc}",
            ) from exc

        verified_flags = await self.repository.get_all_url_verifications()
        sources = [
            SourceCard(
                title=s["title"],
                url=s["url"],
                description=s["description"],
                content_type=s["content_type"],
                physio_verification_count=verified_flags.get(s["url"], {}).get("physio", 0),
                trainer_verification_count=verified_flags.get(s["url"], {}).get("trainer", 0),
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

        Reuses an existing content row if one already exists for the same URL.
        Skips inserting a recommendation if one already exists for this user and content.

        Args:
            request: The save request with source details and user context.
        """
        existing_content = await self.repository.get_content_by_url(request.url)
        if existing_content:
            content_id = existing_content["content_id"]
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

        Verification is a global quality stamp on the URL itself — counts live in
        url_verifications and are independent of any content row.

        Args:
            request: The verify request with url, user_id, user_role, and verified.

        Raises:
            HTTPException: 403 if the requesting user is not a professional role.
        """
        if request.user_role not in ("PHYSIOTHERAPIST", "FITNESS_TRAINER"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only professionals can verify content.",
            )
        await self.repository.upsert_url_verification(
            request.url, request.user_role, request.verified
        )
