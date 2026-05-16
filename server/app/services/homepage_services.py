from fastapi import HTTPException, status

from app.dal.homepage_repository import HomepageRepository
from app.models.enums.role import Role
from app.models.homepage.homepage import AllPatientItem, HomePatientCard
from app.models.patients.visit_type import VisitType

_ROLE_TO_VISIT_TYPE: dict[Role, VisitType] = {
    Role.PHYSIOTHERAPIST: VisitType.PHYSIOTHERAPIST,
    Role.FITNESS_TRAINER: VisitType.FITNESS,
}


class HomepageServices:
    """Business logic for therapist homepage operations."""

    def __init__(self, repository: HomepageRepository) -> None:
        self.repository = repository

    async def get_home_patients(
        self, therapist_id: str, therapist_role: Role
    ) -> list[HomePatientCard]:
        """Return patient cards with progress percentages for the homepage.

        Each card belongs to a patient that the therapist has previously
        treated. Progress is calculated from the patient's active plan for
        the same visit type.

        Args:
            therapist_id: The unique identifier of the logged-in therapist.
            therapist_role: The role of the logged-in therapist.

        Returns:
            A list of HomePatientCard instances.

        Raises:
            HTTPException: 400 if the role cannot be mapped to a visit type.
        """
        visit_type = _ROLE_TO_VISIT_TYPE.get(therapist_role)
        if visit_type is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role for homepage patient listing",
            )
        patient_rows = await self.repository.get_home_patients(
            therapist_id,
            therapist_role.value,
            visit_type.value,
        )
        cards: list[HomePatientCard] = []
        for row in patient_rows:
            progress = await self.repository.get_patient_progress(
                row["patient_id"], visit_type.value
            )
            cards.append(
                HomePatientCard(
                    patient_id=row["patient_id"],
                    first_name=row["first_name"],
                    last_name=row["last_name"],
                    medical_diagnosis=row["medical_diagnosis"],
                    progress_percentage=progress["progress_percentage"],
                    last_progress_update=progress["last_progress_update"],
                )
            )
        return cards

    async def get_all_patients(self) -> list[AllPatientItem]:
        """Return all patients ordered alphabetically for the modal.

        Returns:
            A list of AllPatientItem instances.
        """
        return await self.repository.get_all_patients()
