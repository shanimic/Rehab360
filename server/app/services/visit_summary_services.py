from fastapi import HTTPException, status

from app.dal.visit_summary_repository import VisitSummaryRepository
from app.models.enums.role import Role
from app.models.patients.visit_type import VisitType
from app.models.visit_summary.visit_summary import (
    CreatePlanRequest,
    CreatePlanResponse,
    CreateVisitSummaryRequest,
    CreateVisitSummaryResponse,
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

    async def create_visit_summary(
        self, request: CreateVisitSummaryRequest
    ) -> CreateVisitSummaryResponse:
        """Derive visit_type from therapist role and persist the visit summary.

        Args:
            request: The visit summary payload from the route.

        Returns:
            A CreateVisitSummaryResponse with the new session_id.

        Raises:
            HTTPException: 400 if the therapist role is not permitted.
        """
        visit_type = _ROLE_TO_VISIT_TYPE.get(request.therapist_role)
        if visit_type is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid therapist role for creating a visit summary",
            )
        return await self.repository.create_visit_summary(request, visit_type)

    async def get_sessions_by_patient(self, patient_id: str) -> list[SessionListItem]:
        """Return all active sessions for a patient.

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

    async def create_plan(self, request: CreatePlanRequest) -> CreatePlanResponse:
        """Persist a new treatment plan linked to the given session.

        Args:
            request: The plan payload including session_id, goal, and date range.

        Returns:
            A CreatePlanResponse with the new plan_id and linked session_id.
        """
        return await self.repository.create_plan(request)
