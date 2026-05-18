from fastapi import HTTPException, status

from app.dal.patient_details_repository import PatientDetailsRepository
from app.models.enums.role import Role
from app.models.patient_details.patient_details import PatientDetailsResponse


class PatientDetailsServices:
    """Business logic for the patient details page."""

    def __init__(self, repository: PatientDetailsRepository) -> None:
        self.repository = repository

    async def get_patient_details(
        self, patient_id: str, viewer_role: Role | None
    ) -> PatientDetailsResponse:
        """Aggregate patient info, latest visit, and active plans into one response.

        Args:
            patient_id: The patient's user ID.
            viewer_role: The role of the user viewing the page, or None if not provided.

        Returns:
            A PatientDetailsResponse containing all aggregated data.

        Raises:
            HTTPException: 404 if the patient does not exist.
        """
        patient = await self.repository.get_patient_details(patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found",
            )

        latest_visit_summary = await self.repository.get_latest_visit_summary(
            patient_id
        )
        treatment_plan = await self.repository.get_current_plan_with_progress(
            patient_id, "PHYSIOTHERAPIST"
        )
        fitness_plan = await self.repository.get_current_plan_with_progress(
            patient_id, "FITNESS"
        )

        return PatientDetailsResponse(
            patient=patient,
            latest_visit_summary=latest_visit_summary,
            treatment_plan=treatment_plan,
            fitness_plan=fitness_plan,
            viewer_role=viewer_role,
        )
