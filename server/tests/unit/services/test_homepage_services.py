import asyncio
import datetime
import unittest

from fastapi import HTTPException
from mockito import expect, mock

from app.dal.homepage_repository import HomepageRepository
from app.models.enums.role import Role
from app.models.homepage.homepage import AllPatientItem, HomePatientCard
from app.services.homepage_services import HomepageServices


class HomepageServicesTest(unittest.TestCase):

    # ------------------------------------------------------------------ #
    # get_home_patients                                                     #
    # ------------------------------------------------------------------ #

    def test_get_home_patients_returns_card_with_progress_and_last_update(self) -> None:
        """
        Given the repository returns one patient row and a progress dict with
        a non-null last_progress_update,
        When get_home_patients is called with a PHYSIOTHERAPIST role,
        Then a single HomePatientCard is returned with all fields populated.
        """
        # PREPARE
        repo = mock(HomepageRepository)
        service = HomepageServices(repository=repo)
        patient_row = {
            "patient_id": "P100",
            "first_name": "Alice",
            "last_name": "Smith",
            "medical_diagnosis": "Shoulder impingement",
        }
        progress = {
            "progress_percentage": 75.0,
            "last_progress_update": datetime.date(2026, 5, 1),
        }

        # MOCK
        expect(repo, times=1).get_home_patients(
            "T200", "PHYSIOTHERAPIST", "PHYSIOTHERAPIST"
        ).thenReturn([patient_row])
        expect(repo, times=1).get_patient_progress(
            "P100", "PHYSIOTHERAPIST"
        ).thenReturn(progress)

        # ACT
        result = asyncio.run(service.get_home_patients("T200", Role.PHYSIOTHERAPIST))

        # ASSERT
        self.assertEqual(len(result), 1)
        card = result[0]
        self.assertIsInstance(card, HomePatientCard)
        self.assertEqual(card.patient_id, "P100")
        self.assertEqual(card.first_name, "Alice")
        self.assertEqual(card.last_name, "Smith")
        self.assertEqual(card.medical_diagnosis, "Shoulder impingement")
        self.assertAlmostEqual(card.progress_percentage, 75.0)
        self.assertEqual(card.last_progress_update, datetime.date(2026, 5, 1))

    def test_get_home_patients_null_percentage_defaults_to_zero(self) -> None:
        """
        Given the repository returns a progress dict where progress_percentage
        is 0.0 (already defaulted by DAL from NULL),
        When get_home_patients is called,
        Then the card has progress_percentage of 0.0.
        """
        # PREPARE
        repo = mock(HomepageRepository)
        service = HomepageServices(repository=repo)
        patient_row = {
            "patient_id": "P100",
            "first_name": "Alice",
            "last_name": "Smith",
            "medical_diagnosis": "Knee pain",
        }
        progress = {"progress_percentage": 0.0, "last_progress_update": None}

        # MOCK
        expect(repo, times=1).get_home_patients(
            "T200", "PHYSIOTHERAPIST", "PHYSIOTHERAPIST"
        ).thenReturn([patient_row])
        expect(repo, times=1).get_patient_progress(
            "P100", "PHYSIOTHERAPIST"
        ).thenReturn(progress)

        # ACT
        result = asyncio.run(service.get_home_patients("T200", Role.PHYSIOTHERAPIST))

        # ASSERT
        self.assertEqual(result[0].progress_percentage, 0.0)

    def test_get_home_patients_null_last_progress_update_is_none_on_card(self) -> None:
        """
        Given the repository returns a progress dict with a non-zero percentage
        but a null last_progress_update,
        When get_home_patients is called,
        Then the card has last_progress_update of None.
        """
        # PREPARE
        repo = mock(HomepageRepository)
        service = HomepageServices(repository=repo)
        patient_row = {
            "patient_id": "P100",
            "first_name": "Alice",
            "last_name": "Smith",
            "medical_diagnosis": "Back pain",
        }
        progress = {"progress_percentage": 50.0, "last_progress_update": None}

        # MOCK
        expect(repo, times=1).get_home_patients(
            "T200", "PHYSIOTHERAPIST", "PHYSIOTHERAPIST"
        ).thenReturn([patient_row])
        expect(repo, times=1).get_patient_progress(
            "P100", "PHYSIOTHERAPIST"
        ).thenReturn(progress)

        # ACT
        result = asyncio.run(service.get_home_patients("T200", Role.PHYSIOTHERAPIST))

        # ASSERT
        self.assertIsNone(result[0].last_progress_update)
        self.assertAlmostEqual(result[0].progress_percentage, 50.0)

    def test_get_home_patients_fitness_trainer_role_maps_to_fitness_visit_type(self) -> None:
        """
        Given the logged-in user has role FITNESS_TRAINER,
        When get_home_patients is called,
        Then the DAL is queried with visit_type 'FITNESS'.
        """
        # PREPARE
        repo = mock(HomepageRepository)
        service = HomepageServices(repository=repo)
        progress = {"progress_percentage": 60.0, "last_progress_update": None}

        # MOCK
        expect(repo, times=1).get_home_patients(
            "F300", "FITNESS_TRAINER", "FITNESS"
        ).thenReturn([{
            "patient_id": "P200",
            "first_name": "Bob",
            "last_name": "Jones",
            "medical_diagnosis": "Hip rehab",
        }])
        expect(repo, times=1).get_patient_progress(
            "P200", "FITNESS"
        ).thenReturn(progress)

        # ACT
        result = asyncio.run(service.get_home_patients("F300", Role.FITNESS_TRAINER))

        # ASSERT
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].patient_id, "P200")

    def test_get_home_patients_patient_role_raises_400(self) -> None:
        """
        Given the logged-in user has role PATIENT,
        When get_home_patients is called,
        Then an HTTP 400 Bad Request exception is raised.
        """
        # PREPARE
        repo = mock(HomepageRepository)
        service = HomepageServices(repository=repo)

        # ACT / ASSERT
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(service.get_home_patients("P999", Role.PATIENT))
        self.assertEqual(ctx.exception.status_code, 400)

    def test_get_home_patients_empty_patient_list_returns_empty(self) -> None:
        """
        Given the repository returns no patient rows,
        When get_home_patients is called,
        Then an empty list is returned without calling get_patient_progress.
        """
        # PREPARE
        repo = mock(HomepageRepository)
        service = HomepageServices(repository=repo)

        # MOCK
        expect(repo, times=1).get_home_patients(
            "T200", "PHYSIOTHERAPIST", "PHYSIOTHERAPIST"
        ).thenReturn([])

        # ACT
        result = asyncio.run(service.get_home_patients("T200", Role.PHYSIOTHERAPIST))

        # ASSERT
        self.assertEqual(result, [])

    # ------------------------------------------------------------------ #
    # get_all_patients                                                      #
    # ------------------------------------------------------------------ #

    def test_get_all_patients_returns_list_from_repository(self) -> None:
        """
        Given the repository returns two AllPatientItem rows,
        When get_all_patients is called,
        Then the same list is returned unchanged.
        """
        # PREPARE
        repo = mock(HomepageRepository)
        service = HomepageServices(repository=repo)
        patients = [
            AllPatientItem(patient_id="P100", first_name="Alice", last_name="Smith"),
            AllPatientItem(patient_id="P200", first_name="Bob", last_name="Jones"),
        ]

        # MOCK
        expect(repo, times=1).get_all_patients().thenReturn(patients)

        # ACT
        result = asyncio.run(service.get_all_patients())

        # ASSERT
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0].patient_id, "P100")
        self.assertEqual(result[1].patient_id, "P200")

    def test_get_all_patients_empty_returns_empty_list(self) -> None:
        """
        Given no patients exist in the system,
        When get_all_patients is called,
        Then an empty list is returned.
        """
        # PREPARE
        repo = mock(HomepageRepository)
        service = HomepageServices(repository=repo)

        # MOCK
        expect(repo, times=1).get_all_patients().thenReturn([])

        # ACT
        result = asyncio.run(service.get_all_patients())

        # ASSERT
        self.assertEqual(result, [])
