import asyncio
import datetime
import unittest

from fastapi import HTTPException
from mockito import expect, mock

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
from app.services.visit_summary_services import VisitSummaryServices


def _make_patient_details(**overrides) -> PatientDetails:
    defaults = {
        "patient_id": "P100",
        "patient_first_name": "John",
        "patient_last_name": "Smith",
        "phone": "+972-50-000-0001",
        "birth_date": datetime.date(1981, 3, 15),
        "email": "john@example.com",
        "plan_id": None,
        "visit_date": datetime.date(2025, 1, 6),
        "visit_time": datetime.time(10, 0, 0),
    }
    defaults.update(overrides)
    return PatientDetails(**defaults)


def _make_visit_summary_details(**overrides) -> VisitSummaryDetails:
    defaults = {
        "patient_id": "P100",
        "patient_first_name": "John",
        "patient_last_name": "Smith",
        "phone": "+972-50-000-0001",
        "birth_date": datetime.date(1981, 3, 15),
        "email": "john@example.com",
        "session_id": 42,
        "visit_date": datetime.date(2025, 1, 6),
        "visit_time": datetime.time(10, 0, 0),
        "visit_type": "PHYSIOTHERAPIST",
        "treatment_area": "Shoulder",
        "medical_diagnosis": "Impingement",
        "description": "Session notes",
        "recommendations": None,
        "therapist_first_name": "Liran",
        "therapist_last_name": "Cohen",
        "therapist_role": "PHYSIOTHERAPIST",
        "plan_id": None,
    }
    defaults.update(overrides)
    return VisitSummaryDetails(**defaults)


def _make_create_request(**overrides) -> CreateVisitSummaryRequest:
    defaults = {
        "visit_date": datetime.date(2025, 1, 6),
        "visit_time": datetime.time(10, 0, 0),
        "treatment_area": "Shoulder",
        "medical_diagnosis": "Impingement",
        "description": "Session notes",
        "patient_id": "P100",
        "therapist_id": "T001",
        "therapist_role": Role.PHYSIOTHERAPIST,
        "copy_previous_plan": False,
    }
    defaults.update(overrides)
    return CreateVisitSummaryRequest(**defaults)


class VisitSummaryServicesTest(unittest.TestCase):

    # ------------------------------------------------------------------ #
    # get_patient_details                                                   #
    # ------------------------------------------------------------------ #

    def test_get_patient_details_found_returns_patient_details(self) -> None:
        """
        Given the repository returns a PatientDetails row for the given patient_id,
        When get_patient_details is called,
        Then the PatientDetails instance is returned.
        """
        # PREPARE
        repo = mock(VisitSummaryRepository)
        service = VisitSummaryServices(repository=repo)
        patient = _make_patient_details()

        # MOCK
        expect(repo, times=1).get_patient_details("P100").thenReturn(patient)

        # ACT
        result = asyncio.run(service.get_patient_details("P100"))

        # ASSERT
        self.assertEqual(result.patient_id, "P100")
        self.assertEqual(result.patient_first_name, "John")

    def test_get_patient_details_not_found_raises_404(self) -> None:
        """
        Given the repository returns None for the given patient_id,
        When get_patient_details is called,
        Then an HTTP 404 Not Found exception is raised.
        """
        # PREPARE
        repo = mock(VisitSummaryRepository)
        service = VisitSummaryServices(repository=repo)

        # MOCK
        expect(repo, times=1).get_patient_details("GHOST").thenReturn(None)

        # ACT / ASSERT
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(service.get_patient_details("GHOST"))
        self.assertEqual(ctx.exception.status_code, 404)

    # ------------------------------------------------------------------ #
    # check_has_previous_plan                                              #
    # ------------------------------------------------------------------ #

    def test_check_has_previous_plan_with_plan_returns_true(self) -> None:
        """
        Given an active session with a linked plan exists for the patient and visit type,
        When check_has_previous_plan is called,
        Then has_previous_plan is True.
        """
        # PREPARE
        repo = mock(VisitSummaryRepository)
        service = VisitSummaryServices(repository=repo)

        # MOCK
        expect(repo, times=1).get_latest_session_with_plan(
            "P100", VisitType.PHYSIOTHERAPIST
        ).thenReturn({"session_id": 10, "plan_id": 5})

        # ACT
        result = asyncio.run(
            service.check_has_previous_plan("P100", VisitType.PHYSIOTHERAPIST)
        )

        # ASSERT
        self.assertIsInstance(result, HasPreviousPlanResponse)
        self.assertTrue(result.has_previous_plan)

    def test_check_has_previous_plan_no_session_returns_false(self) -> None:
        """
        Given no active session exists for the patient and visit type,
        When check_has_previous_plan is called,
        Then has_previous_plan is False.
        """
        # PREPARE
        repo = mock(VisitSummaryRepository)
        service = VisitSummaryServices(repository=repo)

        # MOCK
        expect(repo, times=1).get_latest_session_with_plan(
            "P100", VisitType.PHYSIOTHERAPIST
        ).thenReturn(None)

        # ACT
        result = asyncio.run(
            service.check_has_previous_plan("P100", VisitType.PHYSIOTHERAPIST)
        )

        # ASSERT
        self.assertFalse(result.has_previous_plan)

    def test_check_has_previous_plan_no_plan_in_any_session_returns_false(self) -> None:
        """
        Given no session for the patient and visit type has any linked plan,
        When check_has_previous_plan is called,
        Then has_previous_plan is False.
        """
        # PREPARE
        repo = mock(VisitSummaryRepository)
        service = VisitSummaryServices(repository=repo)

        # MOCK
        expect(repo, times=1).get_latest_session_with_plan(
            "P100", VisitType.FITNESS
        ).thenReturn(None)

        # ACT
        result = asyncio.run(
            service.check_has_previous_plan("P100", VisitType.FITNESS)
        )

        # ASSERT
        self.assertFalse(result.has_previous_plan)

    # ------------------------------------------------------------------ #
    # create_visit_summary                                                  #
    # ------------------------------------------------------------------ #

    def test_create_visit_summary_physiotherapist_role_maps_to_physiotherapist_visit_type(
        self,
    ) -> None:
        """
        Given a CreateVisitSummaryRequest with therapist_role PHYSIOTHERAPIST and no copy flag,
        When create_visit_summary is called,
        Then the repository is called with VisitType.PHYSIOTHERAPIST and the response is returned.
        """
        # PREPARE
        repo = mock(VisitSummaryRepository)
        service = VisitSummaryServices(repository=repo)
        request = _make_create_request(
            therapist_role=Role.PHYSIOTHERAPIST, copy_previous_plan=False
        )
        response = CreateVisitSummaryResponse(session_id=42)

        # MOCK
        expect(repo, times=1).get_latest_session_with_plan(
            "P100", VisitType.PHYSIOTHERAPIST
        ).thenReturn(None)
        expect(repo, times=1).begin_transaction().thenReturn(None)
        expect(repo, times=1).deactivate_sessions_by_patient_and_visit_type(
            "P100", VisitType.PHYSIOTHERAPIST
        ).thenReturn(None)
        expect(repo, times=1).create_visit_summary(
            request, VisitType.PHYSIOTHERAPIST
        ).thenReturn(response)
        expect(repo, times=1).commit().thenReturn(None)

        # ACT
        result = asyncio.run(service.create_visit_summary(request))

        # ASSERT
        self.assertEqual(result.session_id, 42)

    def test_create_visit_summary_fitness_trainer_role_maps_to_fitness_visit_type(
        self,
    ) -> None:
        """
        Given a CreateVisitSummaryRequest with therapist_role FITNESS_TRAINER and no copy flag,
        When create_visit_summary is called,
        Then the repository is called with VisitType.FITNESS and the response is returned.
        """
        # PREPARE
        repo = mock(VisitSummaryRepository)
        service = VisitSummaryServices(repository=repo)
        request = _make_create_request(
            therapist_role=Role.FITNESS_TRAINER, copy_previous_plan=False
        )
        response = CreateVisitSummaryResponse(session_id=99)

        # MOCK
        expect(repo, times=1).get_latest_session_with_plan(
            "P100", VisitType.FITNESS
        ).thenReturn(None)
        expect(repo, times=1).begin_transaction().thenReturn(None)
        expect(repo, times=1).deactivate_sessions_by_patient_and_visit_type(
            "P100", VisitType.FITNESS
        ).thenReturn(None)
        expect(repo, times=1).create_visit_summary(
            request, VisitType.FITNESS
        ).thenReturn(response)
        expect(repo, times=1).commit().thenReturn(None)

        # ACT
        result = asyncio.run(service.create_visit_summary(request))

        # ASSERT
        self.assertEqual(result.session_id, 99)

    def test_create_visit_summary_patient_role_raises_400(self) -> None:
        """
        Given a CreateVisitSummaryRequest with therapist_role PATIENT (not a valid therapist),
        When create_visit_summary is called,
        Then an HTTP 400 Bad Request exception is raised before calling the repository.
        """
        # PREPARE
        repo = mock(VisitSummaryRepository)
        service = VisitSummaryServices(repository=repo)
        request = _make_create_request(therapist_role=Role.PATIENT)

        # ACT / ASSERT
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(service.create_visit_summary(request))
        self.assertEqual(ctx.exception.status_code, 400)

    def test_create_visit_summary_copy_previous_plan_true_copies_plan_and_exercises(
        self,
    ) -> None:
        """
        Given copy_previous_plan is True and a previous active plan exists,
        When create_visit_summary is called,
        Then the plan and exercises are copied to the new session atomically.
        """
        # PREPARE
        repo = mock(VisitSummaryRepository)
        service = VisitSummaryServices(repository=repo)
        request = _make_create_request(
            therapist_role=Role.PHYSIOTHERAPIST, copy_previous_plan=True
        )
        response = CreateVisitSummaryResponse(session_id=50)

        # MOCK
        expect(repo, times=1).get_latest_session_with_plan(
            "P100", VisitType.PHYSIOTHERAPIST
        ).thenReturn({"session_id": 10, "plan_id": 3})
        expect(repo, times=1).begin_transaction().thenReturn(None)
        expect(repo, times=1).deactivate_sessions_by_patient_and_visit_type(
            "P100", VisitType.PHYSIOTHERAPIST
        ).thenReturn(None)
        expect(repo, times=1).create_visit_summary(
            request, VisitType.PHYSIOTHERAPIST
        ).thenReturn(response)
        expect(repo, times=1).copy_plan_to_session(3, 50).thenReturn(7)
        expect(repo, times=1).copy_plan_exercises(3, 10, 7, 50).thenReturn(None)
        expect(repo, times=1).commit().thenReturn(None)

        # ACT
        result = asyncio.run(service.create_visit_summary(request))

        # ASSERT
        self.assertEqual(result.session_id, 50)

    def test_create_visit_summary_copy_previous_plan_true_no_previous_plan_raises_409(
        self,
    ) -> None:
        """
        Given copy_previous_plan is True but no previous plan exists,
        When create_visit_summary is called,
        Then an HTTP 409 Conflict exception is raised and no transaction is started.
        """
        # PREPARE
        repo = mock(VisitSummaryRepository)
        service = VisitSummaryServices(repository=repo)
        request = _make_create_request(
            therapist_role=Role.PHYSIOTHERAPIST, copy_previous_plan=True
        )

        # MOCK
        expect(repo, times=1).get_latest_session_with_plan(
            "P100", VisitType.PHYSIOTHERAPIST
        ).thenReturn(None)

        # ACT / ASSERT
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(service.create_visit_summary(request))
        self.assertEqual(ctx.exception.status_code, 409)

    def test_create_visit_summary_physiotherapist_does_not_deactivate_fitness_sessions(
        self,
    ) -> None:
        """
        Given a PHYSIOTHERAPIST request,
        When create_visit_summary is called,
        Then deactivate is called with VisitType.PHYSIOTHERAPIST only (not FITNESS).
        """
        # PREPARE
        repo = mock(VisitSummaryRepository)
        service = VisitSummaryServices(repository=repo)
        request = _make_create_request(
            therapist_role=Role.PHYSIOTHERAPIST, copy_previous_plan=False
        )
        response = CreateVisitSummaryResponse(session_id=55)

        # MOCK
        expect(repo, times=1).get_latest_session_with_plan(
            "P100", VisitType.PHYSIOTHERAPIST
        ).thenReturn(None)
        expect(repo, times=1).begin_transaction().thenReturn(None)
        expect(repo, times=1).deactivate_sessions_by_patient_and_visit_type(
            "P100", VisitType.PHYSIOTHERAPIST
        ).thenReturn(None)
        expect(repo, times=0).deactivate_sessions_by_patient_and_visit_type(
            "P100", VisitType.FITNESS
        ).thenReturn(None)
        expect(repo, times=1).create_visit_summary(
            request, VisitType.PHYSIOTHERAPIST
        ).thenReturn(response)
        expect(repo, times=1).commit().thenReturn(None)

        # ACT
        result = asyncio.run(service.create_visit_summary(request))

        # ASSERT
        self.assertEqual(result.session_id, 55)

    def test_create_visit_summary_fitness_does_not_deactivate_physiotherapist_sessions(
        self,
    ) -> None:
        """
        Given a FITNESS_TRAINER request,
        When create_visit_summary is called,
        Then deactivate is called with VisitType.FITNESS only (not PHYSIOTHERAPIST).
        """
        # PREPARE
        repo = mock(VisitSummaryRepository)
        service = VisitSummaryServices(repository=repo)
        request = _make_create_request(
            therapist_role=Role.FITNESS_TRAINER, copy_previous_plan=False
        )
        response = CreateVisitSummaryResponse(session_id=66)

        # MOCK
        expect(repo, times=1).get_latest_session_with_plan(
            "P100", VisitType.FITNESS
        ).thenReturn(None)
        expect(repo, times=1).begin_transaction().thenReturn(None)
        expect(repo, times=1).deactivate_sessions_by_patient_and_visit_type(
            "P100", VisitType.FITNESS
        ).thenReturn(None)
        expect(repo, times=0).deactivate_sessions_by_patient_and_visit_type(
            "P100", VisitType.PHYSIOTHERAPIST
        ).thenReturn(None)
        expect(repo, times=1).create_visit_summary(
            request, VisitType.FITNESS
        ).thenReturn(response)
        expect(repo, times=1).commit().thenReturn(None)

        # ACT
        result = asyncio.run(service.create_visit_summary(request))

        # ASSERT
        self.assertEqual(result.session_id, 66)

    def test_create_visit_summary_save_and_create_plan_does_not_copy_plan(
        self,
    ) -> None:
        """
        Given copy_previous_plan is False and a previous plan exists for the patient,
        When create_visit_summary is called,
        Then only the session is created and no plan copy methods are invoked.
        """
        # PREPARE
        repo = mock(VisitSummaryRepository)
        service = VisitSummaryServices(repository=repo)
        request = _make_create_request(
            therapist_role=Role.PHYSIOTHERAPIST, copy_previous_plan=False
        )
        response = CreateVisitSummaryResponse(session_id=77)

        # MOCK — copy_plan_to_session must NOT be called with source plan_id=3, new session_id=77
        expect(repo, times=1).get_latest_session_with_plan(
            "P100", VisitType.PHYSIOTHERAPIST
        ).thenReturn({"session_id": 10, "plan_id": 3})
        expect(repo, times=1).begin_transaction().thenReturn(None)
        expect(repo, times=1).deactivate_sessions_by_patient_and_visit_type(
            "P100", VisitType.PHYSIOTHERAPIST
        ).thenReturn(None)
        expect(repo, times=1).create_visit_summary(
            request, VisitType.PHYSIOTHERAPIST
        ).thenReturn(response)
        expect(repo, times=0).copy_plan_to_session(3, 77).thenReturn(None)
        expect(repo, times=1).commit().thenReturn(None)

        # ACT
        result = asyncio.run(service.create_visit_summary(request))

        # ASSERT
        self.assertEqual(result.session_id, 77)

    # ------------------------------------------------------------------ #
    # get_sessions_by_patient                                              #
    # ------------------------------------------------------------------ #

    def test_get_sessions_by_patient_returns_list_from_repository(self) -> None:
        """
        Given the repository returns two SessionListItem rows for the patient,
        When get_sessions_by_patient is called,
        Then a list of two SessionListItem instances is returned.
        """
        # PREPARE
        repo = mock(VisitSummaryRepository)
        service = VisitSummaryServices(repository=repo)
        sessions = [
            SessionListItem(
                session_id=1,
                visit_date=datetime.date(2025, 1, 6),
                visit_time=datetime.time(10, 0, 0),
                visit_type="PHYSIOTHERAPIST",
                treatment_area="Shoulder",
                medical_diagnosis="Impingement",
                description="First session",
                therapist_first_name="Liran",
                therapist_last_name="Cohen",
            ),
            SessionListItem(
                session_id=2,
                visit_date=datetime.date(2025, 1, 8),
                visit_time=datetime.time(11, 0, 0),
                visit_type="FITNESS",
                treatment_area="Core",
                medical_diagnosis="Lower back",
                description="Second session",
                therapist_first_name="Alex",
                therapist_last_name="Trainer",
            ),
        ]

        # MOCK
        expect(repo, times=1).get_sessions_by_patient("P100").thenReturn(sessions)

        # ACT
        result = asyncio.run(service.get_sessions_by_patient("P100"))

        # ASSERT
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0].session_id, 1)
        self.assertEqual(result[1].visit_type, "FITNESS")

    # ------------------------------------------------------------------ #
    # get_visit_summary_by_session_id                                      #
    # ------------------------------------------------------------------ #

    def test_get_visit_summary_by_session_id_found_returns_details(self) -> None:
        """
        Given the repository returns a VisitSummaryDetails row for the given session_id,
        When get_visit_summary_by_session_id is called,
        Then the VisitSummaryDetails instance is returned.
        """
        # PREPARE
        repo = mock(VisitSummaryRepository)
        service = VisitSummaryServices(repository=repo)
        details = _make_visit_summary_details(session_id=42, plan_id=7)

        # MOCK
        expect(repo, times=1).get_visit_summary_by_session_id(42).thenReturn(details)

        # ACT
        result = asyncio.run(service.get_visit_summary_by_session_id(42))

        # ASSERT
        self.assertEqual(result.session_id, 42)
        self.assertEqual(result.patient_id, "P100")
        self.assertEqual(result.plan_id, 7)

    def test_get_visit_summary_by_session_id_not_found_raises_404(self) -> None:
        """
        Given the repository returns None for the given session_id,
        When get_visit_summary_by_session_id is called,
        Then an HTTP 404 Not Found exception is raised.
        """
        # PREPARE
        repo = mock(VisitSummaryRepository)
        service = VisitSummaryServices(repository=repo)

        # MOCK
        expect(repo, times=1).get_visit_summary_by_session_id(999).thenReturn(None)

        # ACT / ASSERT
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(service.get_visit_summary_by_session_id(999))
        self.assertEqual(ctx.exception.status_code, 404)

    # ------------------------------------------------------------------ #
    # create_plan                                                          #
    # ------------------------------------------------------------------ #

    # ------------------------------------------------------------------ #
    # ensure_plan_exists                                                   #
    # ------------------------------------------------------------------ #

    def test_ensure_plan_exists_plan_already_exists_is_noop(self) -> None:
        """
        Given a plan already exists for the session,
        When ensure_plan_exists is called,
        Then it returns immediately without any copy logic.
        """
        # PREPARE
        repo = mock(VisitSummaryRepository)
        service = VisitSummaryServices(repository=repo)

        # MOCK
        expect(repo, times=1).plan_exists_for_session(42).thenReturn(True)

        # ACT — must not raise
        asyncio.run(service.ensure_plan_exists(42))

    def test_ensure_plan_exists_session_not_found_raises_404(self) -> None:
        """
        Given the session does not exist,
        When ensure_plan_exists is called,
        Then an HTTP 404 is raised.
        """
        # PREPARE
        repo = mock(VisitSummaryRepository)
        service = VisitSummaryServices(repository=repo)

        # MOCK
        expect(repo, times=1).plan_exists_for_session(9999).thenReturn(False)
        expect(repo, times=1).get_session_patient_and_type(9999).thenReturn(None)

        # ACT / ASSERT
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(service.ensure_plan_exists(9999))
        self.assertEqual(ctx.exception.status_code, 404)

    def test_ensure_plan_exists_no_previous_plan_raises_409(self) -> None:
        """
        Given no previous plan exists for the patient and visit type,
        When ensure_plan_exists is called,
        Then an HTTP 409 is raised so the user must create a plan manually.
        """
        # PREPARE
        repo = mock(VisitSummaryRepository)
        service = VisitSummaryServices(repository=repo)

        # MOCK
        expect(repo, times=1).plan_exists_for_session(42).thenReturn(False)
        expect(repo, times=1).get_session_patient_and_type(42).thenReturn(
            {"patient_id": "P100", "visit_type": "PHYSIOTHERAPIST"}
        )
        expect(repo, times=1).get_latest_session_with_plan(
            "P100", VisitType.PHYSIOTHERAPIST
        ).thenReturn(None)

        # ACT / ASSERT
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(service.ensure_plan_exists(42))
        self.assertEqual(ctx.exception.status_code, 409)

    def test_ensure_plan_exists_copies_previous_plan_and_exercises(self) -> None:
        """
        Given no plan exists for the session but a previous plan is available,
        When ensure_plan_exists is called,
        Then the previous plan and its exercises are copied into the session atomically.
        """
        # PREPARE
        repo = mock(VisitSummaryRepository)
        service = VisitSummaryServices(repository=repo)
        previous = {"session_id": 101, "plan_id": 3}

        # MOCK
        expect(repo, times=1).plan_exists_for_session(42).thenReturn(False)
        expect(repo, times=1).get_session_patient_and_type(42).thenReturn(
            {"patient_id": "P100", "visit_type": "PHYSIOTHERAPIST"}
        )
        expect(repo, times=1).get_latest_session_with_plan(
            "P100", VisitType.PHYSIOTHERAPIST
        ).thenReturn(previous)
        expect(repo, times=1).begin_transaction().thenReturn(None)
        expect(repo, times=1).copy_plan_to_session(3, 42).thenReturn(99)
        expect(repo, times=1).copy_plan_exercises(3, 101, 99, 42).thenReturn(None)
        expect(repo, times=1).commit().thenReturn(None)

        # ACT — must not raise
        asyncio.run(service.ensure_plan_exists(42))

    def test_create_plan_delegates_to_repository_and_returns_response(self) -> None:
        """
        Given a valid CreatePlanRequest,
        When create_plan is called,
        Then the repository's create_plan is invoked once and the CreatePlanResponse is returned.
        """
        # PREPARE
        repo = mock(VisitSummaryRepository)
        service = VisitSummaryServices(repository=repo)
        request = CreatePlanRequest(
            session_id=42,
            goal="Recover full range of motion",
            start_date=datetime.date(2025, 1, 6),
            end_date=datetime.date(2025, 3, 6),
        )
        response = CreatePlanResponse(plan_id=7, session_id=42)

        # MOCK
        expect(repo, times=1).create_plan(request).thenReturn(response)

        # ACT
        result = asyncio.run(service.create_plan(request))

        # ASSERT
        self.assertEqual(result.plan_id, 7)
        self.assertEqual(result.session_id, 42)
