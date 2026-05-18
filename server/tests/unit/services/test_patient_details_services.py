"""Unit tests for PatientDetailsServices (mocked repository)."""

import asyncio
import datetime
import unittest

from fastapi import HTTPException
from mockito import expect, mock

from app.dal.patient_details_repository import PatientDetailsRepository
from app.models.enums.role import Role
from app.models.patient_details.patient_details import (
    CurrentPlanWithProgress,
    LatestVisitSummary,
    PatientBasicInfo,
)
from app.services.patient_details_services import PatientDetailsServices


def _make_patient_info(**overrides) -> PatientBasicInfo:
    defaults = {
        "user_id": "P001",
        "first_name": "Alice",
        "last_name": "Cohen",
        "phone": "050-1234567",
        "birth_date": datetime.date(1990, 3, 15),
        "email": "alice@example.com",
    }
    defaults.update(overrides)
    return PatientBasicInfo(**defaults)


def _make_latest_visit(**overrides) -> LatestVisitSummary:
    defaults = {
        "session_id": 42,
        "visit_date": datetime.date(2026, 5, 1),
        "visit_time": datetime.time(10, 30, 0),
        "visit_type": "PHYSIOTHERAPIST",
        "therapist_name": "Dr. Ben Levi",
        "description": "Initial assessment",
    }
    defaults.update(overrides)
    return LatestVisitSummary(**defaults)


def _make_plan_with_progress(**overrides) -> CurrentPlanWithProgress:
    defaults = {
        "plan_id": 7,
        "session_id": 42,
        "medical_diagnosis": "ACL tear",
        "start_date": datetime.date(2026, 5, 1),
        "end_date": datetime.date(2026, 8, 1),
        "progress_percentage": 34.5,
        "last_progress_update": datetime.date(2026, 5, 10),
    }
    defaults.update(overrides)
    return CurrentPlanWithProgress(**defaults)


class PatientDetailsServicesTest(unittest.TestCase):

    # ------------------------------------------------------------------ #
    # get_patient_details — happy paths                                   #
    # ------------------------------------------------------------------ #

    def test_returns_full_response_when_all_data_present(self) -> None:
        """
        Given the repository returns patient info, a visit summary, a treatment
        plan, and a fitness plan,
        When get_patient_details is called,
        Then all four fields are present in the response and viewer_role is None.
        """
        # PREPARE
        repo = mock(PatientDetailsRepository)
        service = PatientDetailsServices(repository=repo)
        patient = _make_patient_info()
        visit = _make_latest_visit()
        treatment = _make_plan_with_progress(plan_id=7)
        fitness = _make_plan_with_progress(plan_id=12, session_id=55)

        # MOCK
        expect(repo, times=1).get_patient_details("P001").thenReturn(patient)
        expect(repo, times=1).get_latest_visit_summary("P001").thenReturn(visit)
        expect(repo, times=1).get_current_plan_with_progress(
            "P001", "PHYSIOTHERAPIST"
        ).thenReturn(treatment)
        expect(repo, times=1).get_current_plan_with_progress(
            "P001", "FITNESS"
        ).thenReturn(fitness)

        # ACT
        result = asyncio.run(service.get_patient_details("P001", None))

        # ASSERT
        self.assertEqual(result.patient.user_id, "P001")
        self.assertEqual(result.latest_visit_summary.session_id, 42)
        self.assertEqual(result.treatment_plan.plan_id, 7)
        self.assertEqual(result.fitness_plan.plan_id, 12)
        self.assertIsNone(result.viewer_role)

    def test_returns_response_with_null_latest_visit_summary(self) -> None:
        """
        Given the repository returns no active session for the patient,
        When get_patient_details is called,
        Then latest_visit_summary is None in the response.
        """
        # PREPARE
        repo = mock(PatientDetailsRepository)
        service = PatientDetailsServices(repository=repo)
        patient = _make_patient_info()
        treatment = _make_plan_with_progress()
        fitness = _make_plan_with_progress(plan_id=12, session_id=55)

        # MOCK
        expect(repo, times=1).get_patient_details("P001").thenReturn(patient)
        expect(repo, times=1).get_latest_visit_summary("P001").thenReturn(None)
        expect(repo, times=1).get_current_plan_with_progress(
            "P001", "PHYSIOTHERAPIST"
        ).thenReturn(treatment)
        expect(repo, times=1).get_current_plan_with_progress(
            "P001", "FITNESS"
        ).thenReturn(fitness)

        # ACT
        result = asyncio.run(service.get_patient_details("P001", None))

        # ASSERT
        self.assertIsNone(result.latest_visit_summary)
        self.assertIsNotNone(result.treatment_plan)
        self.assertIsNotNone(result.fitness_plan)

    def test_returns_response_with_null_treatment_plan(self) -> None:
        """
        Given the repository returns no active PHYSIOTHERAPIST plan for the patient,
        When get_patient_details is called,
        Then treatment_plan is None in the response.
        """
        # PREPARE
        repo = mock(PatientDetailsRepository)
        service = PatientDetailsServices(repository=repo)
        patient = _make_patient_info()
        visit = _make_latest_visit()
        fitness = _make_plan_with_progress(plan_id=12, session_id=55)

        # MOCK
        expect(repo, times=1).get_patient_details("P001").thenReturn(patient)
        expect(repo, times=1).get_latest_visit_summary("P001").thenReturn(visit)
        expect(repo, times=1).get_current_plan_with_progress(
            "P001", "PHYSIOTHERAPIST"
        ).thenReturn(None)
        expect(repo, times=1).get_current_plan_with_progress(
            "P001", "FITNESS"
        ).thenReturn(fitness)

        # ACT
        result = asyncio.run(service.get_patient_details("P001", None))

        # ASSERT
        self.assertIsNone(result.treatment_plan)
        self.assertEqual(result.fitness_plan.plan_id, 12)

    def test_returns_response_with_null_fitness_plan(self) -> None:
        """
        Given the repository returns no active FITNESS plan for the patient,
        When get_patient_details is called,
        Then fitness_plan is None in the response.
        """
        # PREPARE
        repo = mock(PatientDetailsRepository)
        service = PatientDetailsServices(repository=repo)
        patient = _make_patient_info()
        visit = _make_latest_visit()
        treatment = _make_plan_with_progress()

        # MOCK
        expect(repo, times=1).get_patient_details("P001").thenReturn(patient)
        expect(repo, times=1).get_latest_visit_summary("P001").thenReturn(visit)
        expect(repo, times=1).get_current_plan_with_progress(
            "P001", "PHYSIOTHERAPIST"
        ).thenReturn(treatment)
        expect(repo, times=1).get_current_plan_with_progress(
            "P001", "FITNESS"
        ).thenReturn(None)

        # ACT
        result = asyncio.run(service.get_patient_details("P001", None))

        # ASSERT
        self.assertIsNone(result.fitness_plan)
        self.assertEqual(result.treatment_plan.plan_id, 7)

    # ------------------------------------------------------------------ #
    # get_patient_details — error case                                    #
    # ------------------------------------------------------------------ #

    def test_patient_not_found_raises_404(self) -> None:
        """
        Given the repository returns None for the patient_id,
        When get_patient_details is called,
        Then an HTTP 404 Not Found exception is raised.
        """
        # PREPARE
        repo = mock(PatientDetailsRepository)
        service = PatientDetailsServices(repository=repo)

        # MOCK
        expect(repo, times=1).get_patient_details("UNKNOWN").thenReturn(None)

        # ACT / ASSERT
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(service.get_patient_details("UNKNOWN", None))
        self.assertEqual(ctx.exception.status_code, 404)

    # ------------------------------------------------------------------ #
    # get_patient_details — viewer_role propagation                       #
    # ------------------------------------------------------------------ #

    def test_viewer_role_physiotherapist_included_in_response(self) -> None:
        """
        Given viewer_role is Role.PHYSIOTHERAPIST,
        When get_patient_details is called,
        Then the response viewer_role equals Role.PHYSIOTHERAPIST.
        """
        # PREPARE
        repo = mock(PatientDetailsRepository)
        service = PatientDetailsServices(repository=repo)
        patient = _make_patient_info()

        # MOCK
        expect(repo, times=1).get_patient_details("P001").thenReturn(patient)
        expect(repo, times=1).get_latest_visit_summary("P001").thenReturn(None)
        expect(repo, times=1).get_current_plan_with_progress(
            "P001", "PHYSIOTHERAPIST"
        ).thenReturn(None)
        expect(repo, times=1).get_current_plan_with_progress(
            "P001", "FITNESS"
        ).thenReturn(None)

        # ACT
        result = asyncio.run(
            service.get_patient_details("P001", Role.PHYSIOTHERAPIST)
        )

        # ASSERT
        self.assertEqual(result.viewer_role, Role.PHYSIOTHERAPIST)

    def test_viewer_role_patient_included_in_response(self) -> None:
        """
        Given viewer_role is Role.PATIENT,
        When get_patient_details is called,
        Then the response viewer_role equals Role.PATIENT.
        """
        # PREPARE
        repo = mock(PatientDetailsRepository)
        service = PatientDetailsServices(repository=repo)
        patient = _make_patient_info()

        # MOCK
        expect(repo, times=1).get_patient_details("P001").thenReturn(patient)
        expect(repo, times=1).get_latest_visit_summary("P001").thenReturn(None)
        expect(repo, times=1).get_current_plan_with_progress(
            "P001", "PHYSIOTHERAPIST"
        ).thenReturn(None)
        expect(repo, times=1).get_current_plan_with_progress(
            "P001", "FITNESS"
        ).thenReturn(None)

        # ACT
        result = asyncio.run(service.get_patient_details("P001", Role.PATIENT))

        # ASSERT
        self.assertEqual(result.viewer_role, Role.PATIENT)
