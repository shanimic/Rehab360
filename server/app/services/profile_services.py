from fastapi import HTTPException, status

from app.dal.profile_repository import ProfileRepository
from app.models.profile.profile import ActivePlan, ProfileData


class ProfileServices:
    def __init__(self, repository: ProfileRepository) -> None:
        self.repository = repository

    async def get_profile_data(self, user_id: str) -> ProfileData:
        """Returns personal info for the given user.

        Args:
            user_id: The user's ID.

        Returns:
            ProfileData for the user.

        Raises:
            HTTPException: 404 if the user is not found.
        """
        profile = await self.repository.get_profile_data(user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return profile

    async def get_active_patient_plans(self, user_id: str) -> list[ActivePlan]:
        """Returns active plans with completion % for a patient.

        Args:
            user_id: The patient's user ID.

        Returns:
            List of ActivePlan instances.
        """
        return await self.repository.get_active_patient_plans(user_id)
