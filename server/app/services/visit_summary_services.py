from fastapi import HTTPException, status

from app.dal.visit_summary_repository import VisitSummaryRepository
from app.models.enums.role import Role
from app.models.patients.visit_type import VisitType
from app.models.visit_summary.visit_summary import (
    CreatePlanRequest,
    CreatePlanResponse,
    CreateVisitSummaryRequest,
    CreateVisitSummaryResponse,
    HasPreviousPlanResponse,
    PatientDetails,
    SessionListItem,
    VisitSummaryDetails,
)

_ROLE_TO_VISIT_TYPE: dict[Role, VisitType] = {
    Role.PHYSIOTHERAPIST: VisitType.PHYSIOTHERAPIST,
    Role.FITNESS_TRAINER: VisitType.FITNESS,
}


class VisitSummaryServices:
    """Business logic for visit summary operations."""

    def __init__(self, repository: VisitSummaryRepository) -> None:
        self.repository = repository

    async def get_patient_details(self, patient_id: str) -> PatientDetails:
        """Return patient details or raise 404 if not found.

        Args:
            patient_id: The unique identifier of the patient.

        Returns:
            A PatientDetails instance.

        Raises:
            HTTPException: 404 if no matching patient exists.
        """
        patient = await self.repository.get_patient_details(patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found",
            )
        return patient

    async def check_has_previous_plan(
        self, patient_id: str, visit_type: VisitType
    ) -> HasPreviousPlanResponse:
        """Return whether any session for this patient and visit type has a plan.

        Session status is not considered — a plan in any session (active or not) qualifies.

        Args:
            patient_id: The unique identifier of the patient.
            visit_type: The visit type to check.

        Returns:
            A HasPreviousPlanResponse indicating plan existence.
        """
        previous = await self.repository.get_latest_session_with_plan(
            patient_id, visit_type
        )
        return HasPreviousPlanResponse(has_previous_plan=previous is not None)

    async def create_visit_summary(
        self, request: CreateVisitSummaryRequest
    ) -> CreateVisitSummaryResponse:
        """Derive visit_type, deactivate prior sessions, create new session, and optionally copy plan.

        When copy_previous_plan is True the most recent plan across any session for the same
        patient and visit_type (active or not) is atomically copied to the new session.
        The entire operation runs in a single transaction.

        Args:
            request: The visit summary payload from the route.

        Returns:
            A CreateVisitSummaryResponse with the new session_id.

        Raises:
            HTTPException: 400 if the therapist role is not permitted.
            HTTPException: 422 if copy_previous_plan is True but no previous plan exists.
        """
        visit_type = _ROLE_TO_VISIT_TYPE.get(request.therapist_role)
        if visit_type is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid therapist role for creating a visit summary",
            )
        previous = await self.repository.get_latest_session_with_plan(
            request.patient_id, visit_type
        )
        has_previous_plan = previous is not None
        if request.copy_previous_plan and not has_previous_plan:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No previous plan exists to copy for this patient and visit type",
            )
        await self.repository.begin_transaction()
        try:
            await self.repository.deactivate_sessions_by_patient_and_visit_type(
                request.patient_id, visit_type
            )
            response = await self.repository.create_visit_summary(request, visit_type)
            if request.copy_previous_plan and has_previous_plan:
                new_plan_id = await self.repository.copy_plan_to_session(
                    previous["plan_id"], response.session_id
                )
                await self.repository.copy_plan_exercises(
                    previous["plan_id"],
                    previous["session_id"],
                    new_plan_id,
                    response.session_id,
                )
            await self.repository.commit()
        except Exception:
            await self.repository.rollback()
            raise
        return response

    async def get_sessions_by_patient(self, patient_id: str) -> list[SessionListItem]:
        """Return all sessions for a patient regardless of status.

        Args:
            patient_id: The unique identifier of the patient.

        Returns:
            A list of SessionListItem instances.
        """
        return await self.repository.get_sessions_by_patient(patient_id)

    async def get_visit_summary_by_session_id(
        self, session_id: int
    ) -> VisitSummaryDetails:
        """Return full visit summary or raise 404 if not found.

        Args:
            session_id: The unique identifier of the session.

        Returns:
            A VisitSummaryDetails instance.

        Raises:
            HTTPException: 404 if no matching session exists.
        """
        visit = await self.repository.get_visit_summary_by_session_id(session_id)
        if not visit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Visit summary not found",
            )
        return visit

    async def ensure_plan_exists(self, session_id: int) -> None:
        """Copy the most recent plan into this session if the session has no plan yet.

        If a plan already exists for the session this is a no-op.
        If no previous plan is available for the patient and visit type a 409 is raised
        so the caller knows the user must create a plan manually.

        Args:
            session_id: The unique identifier of the session to ensure has a plan.

        Returns:
            None

        Raises:
            HTTPException: 404 if the session does not exist.
            HTTPException: 409 if no previous plan exists to copy from.
        """
        if await self.repository.plan_exists_for_session(session_id):
            return
        session_info = await self.repository.get_session_patient_and_type(session_id)
        if not session_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )
        visit_type = VisitType(session_info["visit_type"])
        patient_id: str = session_info["patient_id"]
        previous = await self.repository.get_latest_session_with_plan(patient_id, visit_type)
        if not previous:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No previous plan exists for this visit type. Please create a plan.",
            )
        await self.repository.begin_transaction()
        try:
            new_plan_id = await self.repository.copy_plan_to_session(
                previous["plan_id"], session_id
            )
            await self.repository.copy_plan_exercises(
                previous["plan_id"],
                previous["session_id"],
                new_plan_id,
                session_id,
            )
            await self.repository.commit()
        except Exception:
            await self.repository.rollback()
            raise

    async def create_plan(self, request: CreatePlanRequest) -> CreatePlanResponse:
        """Persist a new treatment plan linked to the given session.

        Args:
            request: The plan payload including session_id, goal, and date range.

        Returns:
            A CreatePlanResponse with the new plan_id and linked session_id.
        """
        return await self.repository.create_plan(request)
