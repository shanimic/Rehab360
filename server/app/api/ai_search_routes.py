from fastapi import APIRouter, Depends

from app.dal.ai_search_repository import AiSearchRepository
from app.db.session import get_db
from app.models.ai_search.ai_search import (
    AiSearchRequest,
    AiSearchResponse,
    QueryHistoryItem,
    SaveContentRequest,
    SavedContentItem,
    VerifyContentRequest,
)
from app.services.ai_search_services import AiSearchServices

ai_search_router = APIRouter()


@ai_search_router.post(
    "/queries",
    tags=["AI Search"],
    response_model=AiSearchResponse,
)
async def submit_query(
    request: AiSearchRequest, db=Depends(get_db)
) -> AiSearchResponse:
    """Submit a natural language query to Gemini and return structured results.

    Args:
        request: The search payload containing query_text, user_id, and user_role.
        db: Database cursor injected by FastAPI.

    Returns:
        AiSearchResponse with query_id, summary, and source cards.
    """
    repository = AiSearchRepository(db=db)
    service = AiSearchServices(repository=repository)
    return await service.search(request)


@ai_search_router.get(
    "/queries/{user_id}",
    tags=["AI Search"],
    response_model=list[QueryHistoryItem],
)
async def get_query_history(
    user_id: str, db=Depends(get_db)
) -> list[QueryHistoryItem]:
    """Return all past queries for a user, newest first.

    Args:
        user_id: The ID of the user.
        db: Database cursor injected by FastAPI.

    Returns:
        A list of QueryHistoryItem instances.
    """
    repository = AiSearchRepository(db=db)
    service = AiSearchServices(repository=repository)
    return await service.get_query_history(user_id)


@ai_search_router.delete(
    "/queries/{query_id}",
    tags=["AI Search"],
    status_code=204,
)
async def delete_query(query_id: int, db=Depends(get_db)) -> None:
    """Delete a query and all its associated content.

    Args:
        query_id: The ID of the query to delete.
        db: Database cursor injected by FastAPI.
    """
    repository = AiSearchRepository(db=db)
    service = AiSearchServices(repository=repository)
    await service.delete_query(query_id)


@ai_search_router.post(
    "/saved-content",
    tags=["AI Search"],
    status_code=201,
)
async def save_content(request: SaveContentRequest, db=Depends(get_db)) -> None:
    """Save a source card to the user's content library.

    Args:
        request: The save payload with source details and user context.
        db: Database cursor injected by FastAPI.
    """
    repository = AiSearchRepository(db=db)
    service = AiSearchServices(repository=repository)
    await service.save_content(request)


@ai_search_router.get(
    "/saved-content/{user_id}",
    tags=["AI Search"],
    response_model=list[SavedContentItem],
)
async def get_saved_content(
    user_id: str, db=Depends(get_db)
) -> list[SavedContentItem]:
    """Return all saved content for a user, newest first.

    Args:
        user_id: The ID of the user.
        db: Database cursor injected by FastAPI.

    Returns:
        A list of SavedContentItem instances.
    """
    repository = AiSearchRepository(db=db)
    service = AiSearchServices(repository=repository)
    return await service.get_saved_content(user_id)


@ai_search_router.delete(
    "/saved-content/{saving_id}",
    tags=["AI Search"],
    status_code=204,
)
async def unsave_content(saving_id: int, db=Depends(get_db)) -> None:
    """Remove a saved content entry from the user's library.

    Args:
        saving_id: The ID of the saved content entry to remove.
        db: Database cursor injected by FastAPI.
    """
    repository = AiSearchRepository(db=db)
    service = AiSearchServices(repository=repository)
    await service.unsave_content(saving_id)


@ai_search_router.post(
    "/verified-content",
    tags=["AI Search"],
    status_code=204,
)
async def verify_content(request: VerifyContentRequest, db=Depends(get_db)) -> None:
    """Mark a source as verified by a professional.

    Args:
        request: The verify payload with url, query_id, user_id, and user_role.
        db: Database cursor injected by FastAPI.
    """
    repository = AiSearchRepository(db=db)
    service = AiSearchServices(repository=repository)
    await service.verify_content(request)
