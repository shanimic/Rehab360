import asyncio
import datetime
import unittest

from fastapi import HTTPException
from mockito import expect, mock

from app.dal.profile_repository import ProfileRepository
from app.models.profile.profile import ActivePlan, ProfileData
from app.services.profile_services import ProfileServices


class ProfileServicesTest(unittest.TestCase):

    # ------------------------------------------------------------------ #
    # get_profile_data                                                     #
    # ------------------------------------------------------------------ #

    def test_get_profile_data_user_exists_returns_profile_data(self) -> None:
        """
        Given a user exists in the repository,
        When get_profile_data is called with a valid user_id,
        Then the ProfileData for that user is returned.
        """
        # PREPARE
        repo = mock(ProfileRepository)
        service = ProfileServices(repository=repo)
        user_id = "user-001"
        expected = ProfileData(
            last_name="Smith",
            email="smith@test.com",
            phone="050-0000001",
            birth_date=datetime.date(1990, 1, 1),
            license_number=None,
        )

        # MOCK
        expect(repo, times=1).get_profile_data(user_id).thenReturn(expected)

        # ACT
        result = asyncio.run(service.get_profile_data(user_id))

        # ASSERT
        self.assertEqual(result.last_name, expected.last_name)
        self.assertEqual(result.email, expected.email)
        self.assertIsNone(result.license_number)

    def test_get_profile_data_user_not_found_raises_404(self) -> None:
        """
        Given no user exists in the repository for the given user_id,
        When get_profile_data is called,
        Then an HTTP 404 Not Found exception is raised.
        """
        # PREPARE
        repo = mock(ProfileRepository)
        service = ProfileServices(repository=repo)
        user_id = "ghost-001"

        # MOCK
        expect(repo, times=1).get_profile_data(user_id).thenReturn(None)

        # ACT / ASSERT
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(service.get_profile_data(user_id))
        self.assertEqual(ctx.exception.status_code, 404)

    # ------------------------------------------------------------------ #
    # get_active_patient_plans                                             #
    # ------------------------------------------------------------------ #

    def test_get_active_patient_plans_returns_plan_list(self) -> None:
        """
        Given the repository returns active plans for the patient,
        When get_active_patient_plans is called,
        Then the list of ActivePlan instances is returned.
        """
        # PREPARE
        repo = mock(ProfileRepository)
        service = ProfileServices(repository=repo)
        user_id = "patient-001"
        plans = [
            ActivePlan(
                plan_id=1,
                goal="Recover knee",
                category="PHYSIOTHERAPY",
                start_date=datetime.date(2026, 1, 1),
                end_date=datetime.date(2026, 3, 1),
                completion_percent=50.0,
            )
        ]

        # MOCK
        expect(repo, times=1).get_active_patient_plans(user_id).thenReturn(plans)

        # ACT
        result = asyncio.run(service.get_active_patient_plans(user_id))

        # ASSERT
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].plan_id, 1)
        self.assertEqual(result[0].goal, "Recover knee")

    def test_get_active_patient_plans_no_plans_returns_empty_list(self) -> None:
        """
        Given the patient has no active plans,
        When get_active_patient_plans is called,
        Then an empty list is returned.
        """
        # PREPARE
        repo = mock(ProfileRepository)
        service = ProfileServices(repository=repo)
        user_id = "patient-002"

        # MOCK
        expect(repo, times=1).get_active_patient_plans(user_id).thenReturn([])

        # ACT
        result = asyncio.run(service.get_active_patient_plans(user_id))

        # ASSERT
        self.assertEqual(result, [])
