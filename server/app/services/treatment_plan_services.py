from fastapi import HTTPException, status

from app.dal.treatment_plan_repository import TreatmentPlanRepository
from app.models.treatment_plan.treatment_plan import (
    CreateTreatmentPlanRequest,
    CreateTreatmentPlanResponse,
    PhysiotherapyExerciseItem,
    TreatmentPlanContext,
    TreatmentPlanDetailsResponse,
)

_PHYSIOTHERAPIST_VISIT_TYPE = "PHYSIOTHERAPIST"


class TreatmentPlanServices:
    """Business logic for treatment plan operations."""

    def __init__(self, repository: TreatmentPlanRepository) -> None:
        self.repository = repository

    async def get_treatment_plan_context(
        self, session_id: int
    ) -> TreatmentPlanContext:
        """Return session context or raise if the session is missing or not PHYSIOTHERAPIST.

        Args:
            session_id: The unique identifier of the session.

        Returns:
            A TreatmentPlanContext instance.

        Raises:
            HTTPException: 404 if the session does not exist or is not active.
            HTTPException: 400 if the session visit_type is not PHYSIOTHERAPIST.
        """
        context = await self.repository.get_treatment_plan_context(session_id)
        if not context:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )
        if context.visit_type != _PHYSIOTHERAPIST_VISIT_TYPE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Treatment plans can only be created for PHYSIOTHERAPIST sessions",
            )
        return context

    async def get_physiotherapy_exercises(self) -> list[PhysiotherapyExerciseItem]:
        """Return all PHYSIOTHERAPIST exercises available for selection.

        Returns:
            A list of PhysiotherapyExerciseItem instances.
        """
        return await self.repository.get_physiotherapy_exercises()

    async def create_treatment_plan(
        self,
        session_id: int,
        request: CreateTreatmentPlanRequest,
    ) -> CreateTreatmentPlanResponse:
        """Validate and persist a new treatment plan with its exercises.

        Args:
            session_id: The session this plan belongs to (from the URL path).
            request: The plan payload including goal, dates, notes, and exercises.

        Returns:
            A CreateTreatmentPlanResponse with the new plan_id and session_id.

        Raises:
            HTTPException: 404 if the session does not exist or is not active.
            HTTPException: 400 if the session is not a PHYSIOTHERAPIST session.
            HTTPException: 409 if a treatment plan already exists for this session.
            HTTPException: 400 if any selected exercise is not a PHYSIOTHERAPIST exercise.
        """
        context = await self.repository.get_treatment_plan_context(session_id)
        if not context:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )
        if context.visit_type != _PHYSIOTHERAPIST_VISIT_TYPE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Treatment plans can only be created for PHYSIOTHERAPIST sessions",
            )
        if await self.repository.plan_exists(session_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A treatment plan already exists for this session",
            )
        requested_ids = [e.exercise_id for e in request.exercises]
        valid_ids = await self.repository.get_valid_physiotherapy_exercise_ids(
            requested_ids
        )
        invalid_ids = set(requested_ids) - set(valid_ids)
        if invalid_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "One or more exercises are invalid or not of PHYSIOTHERAPIST type"
                ),
            )
        return await self.repository.create_treatment_plan(session_id, request)

    async def get_treatment_plan_by_plan_id(
        self, plan_id: int
    ) -> TreatmentPlanDetailsResponse:
        """Return the full treatment plan for a plan, or raise 404 if not found.

        Args:
            plan_id: The unique identifier of the plan.

        Returns:
            A TreatmentPlanDetailsResponse with plan details and exercises.

        Raises:
            HTTPException: 404 if no active treatment plan exists for this plan_id.
        """
        plan = await self.repository.get_treatment_plan_by_plan_id(plan_id)
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Treatment plan not found",
            )
        plan.exercises = await self.repository.get_exercises_by_plan(
            plan.plan_id, plan.session_id
        )
        return plan
