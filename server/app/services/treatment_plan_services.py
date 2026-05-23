from fastapi import HTTPException, status

from app.dal.treatment_plan_repository import TreatmentPlanRepository
from app.models.treatment_plan.treatment_plan import (
    CreateTreatmentPlanRequest,
    CreateTreatmentPlanResponse,
    PhysiotherapyExerciseItem,
    TreatmentPlanContext,
    TreatmentPlanDetailsResponse,
)


class TreatmentPlanServices:
    """Business logic for treatment plan operations."""

    def __init__(self, repository: TreatmentPlanRepository) -> None:
        self.repository = repository

    async def get_treatment_plan_context(
        self, session_id: int
    ) -> TreatmentPlanContext:
        """Return session context or raise if the session is missing or inactive.

        Args:
            session_id: The unique identifier of the session.

        Returns:
            A TreatmentPlanContext instance.

        Raises:
            HTTPException: 404 if the session does not exist or is not active.
        """
        context = await self.repository.get_treatment_plan_context(session_id)
        if not context:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )
        return context

    async def get_exercises(self, visit_type: str) -> list[PhysiotherapyExerciseItem]:
        """Return all exercises for the given visit type, available for plan creation.

        Args:
            visit_type: The visit type to filter exercises by.

        Returns:
            A list of PhysiotherapyExerciseItem instances.
        """
        return await self.repository.get_exercises_by_visit_type(visit_type)

    async def create_treatment_plan(
        self,
        session_id: int,
        request: CreateTreatmentPlanRequest,
    ) -> CreateTreatmentPlanResponse:
        """Validate and persist a new plan, then commit the session.

        After inserting the plan and exercises, all ACTIVE and PENDING_PLAN sessions
        for the same patient and visit_type are deactivated and the new session is
        promoted to ACTIVE — all within a single transaction. This is the point at
        which a PENDING_PLAN session becomes fully committed and visible to users.

        Args:
            session_id: The session this plan belongs to (from the URL path).
            request: The plan payload including goal, dates, notes, and exercises.

        Returns:
            A CreateTreatmentPlanResponse with the new plan_id and session_id.

        Raises:
            HTTPException: 404 if the session does not exist or is not in a plannable state.
            HTTPException: 409 if a plan already exists for this session.
            HTTPException: 400 if any exercise does not match the session's visit type.
        """
        context = await self.repository.get_treatment_plan_context(session_id)
        if not context:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )
        if await self.repository.plan_exists(session_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A plan already exists for this session",
            )
        requested_ids = [e.exercise_id for e in request.exercises]
        valid_ids = await self.repository.get_valid_exercise_ids(
            requested_ids, context.visit_type
        )
        invalid_ids = set(requested_ids) - set(valid_ids)
        if invalid_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more exercises are not valid for this session's visit type",
            )
        await self.repository.begin_transaction()
        try:
            response = await self.repository.create_treatment_plan(session_id, request)
            await self.repository.deactivate_sessions_by_patient_and_visit_type(
                context.patient_id, context.visit_type
            )
            await self.repository.activate_session(session_id)
            await self.repository.commit()
        except Exception:
            await self.repository.rollback()
            raise
        return response

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
