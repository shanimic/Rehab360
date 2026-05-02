from fastapi import APIRouter, Depends

from app.dal.treatment_plan_repository import TreatmentPlanRepository
from app.db.session import get_db
from app.models.treatment_plan.treatment_plan import (
    CreateTreatmentPlanRequest,
    CreateTreatmentPlanResponse,
    PhysiotherapyExerciseItem,
    TreatmentPlanContext,
)
from app.services.treatment_plan_services import TreatmentPlanServices

treatment_plan_router = APIRouter()


@treatment_plan_router.get(
    "/context/{session_id}",
    tags=["Treatment Plan"],
    response_model=TreatmentPlanContext,
)
async def get_treatment_plan_context(
    session_id: int, db=Depends(get_db)
) -> TreatmentPlanContext:
    """Return session context for the create-treatment-plan page.

    Args:
        session_id: The unique identifier of the session.
        db: Database cursor injected by FastAPI.

    Returns:
        TreatmentPlanContext for the requested session.
    """
    repo = TreatmentPlanRepository(db=db)
    service = TreatmentPlanServices(repository=repo)
    return await service.get_treatment_plan_context(session_id)


@treatment_plan_router.get(
    "/exercises",
    tags=["Treatment Plan"],
    response_model=list[PhysiotherapyExerciseItem],
)
async def get_physiotherapy_exercises(
    db=Depends(get_db),
) -> list[PhysiotherapyExerciseItem]:
    """Return all PHYSIOTHERAPIST exercises for the add-exercise popup.

    Args:
        db: Database cursor injected by FastAPI.

    Returns:
        A list of PhysiotherapyExerciseItem instances ordered by name.
    """
    repo = TreatmentPlanRepository(db=db)
    service = TreatmentPlanServices(repository=repo)
    return await service.get_physiotherapy_exercises()


@treatment_plan_router.post(
    "/{session_id}",
    tags=["Treatment Plan"],
    response_model=CreateTreatmentPlanResponse,
)
async def create_treatment_plan(
    session_id: int,
    request: CreateTreatmentPlanRequest,
    db=Depends(get_db),
) -> CreateTreatmentPlanResponse:
    """Create a treatment plan with exercises for the given session.

    Args:
        session_id: The session this plan belongs to (from the URL path).
        request: The plan payload including goal, dates, notes, and exercises.
        db: Database cursor injected by FastAPI.

    Returns:
        CreateTreatmentPlanResponse containing the new plan_id and session_id.
    """
    repo = TreatmentPlanRepository(db=db)
    service = TreatmentPlanServices(repository=repo)
    return await service.create_treatment_plan(session_id, request)
