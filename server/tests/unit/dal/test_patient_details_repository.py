"""Unit tests for PatientDetailsRepository (mocked cursor)."""

import asyncio
import datetime
import unittest

from mockito import ANY, expect, mock

from app.dal.patient_details_repository import PatientDetailsRepository
from tests.unit.async_helpers import async_return


class PatientDetailsRepositoryTest(unittest.TestCase):

    # ------------------------------------------------------------------ #
    # get_patient_details                                                  #
    # ------------------------------------------------------------------ #

    def test_get_patient_details_returns_info_when_row_exists(self) -> None:
        """
        Given the DB returns a matching PATIENT row for the patient_id,
        When get_patient_details is called,
        Then a PatientBasicInfo instance is returned with the expected fields.
        """
        # PREPARE
        cursor = mock()
        repo = PatientDetailsRepository(db=cursor)
        row = {
            "user_id": "P001",
            "first_name": "Alice",
            "last_name": "Cohen",
            "phone": "050-1234567",
            "birth_date": datetime.date(1990, 3, 15),
            "email": "alice@example.com",
        }

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(
            async_return(None)
        )
        expect(cursor, times=1).fetchone().thenReturn(async_return(row))

        # ACT
        result = asyncio.run(repo.get_patient_details("P001"))

        # ASSERT
        assert result is not None
        assert result.user_id == "P001"
        assert result.first_name == "Alice"
        assert result.last_name == "Cohen"
        assert result.phone == "050-1234567"
        assert result.birth_date == datetime.date(1990, 3, 15)
        assert result.email == "alice@example.com"

    def test_get_patient_details_returns_none_when_no_row(self) -> None:
        """
        Given the DB returns no row for the patient_id,
        When get_patient_details is called,
        Then None is returned.
        """
        # PREPARE
        cursor = mock()
        repo = PatientDetailsRepository(db=cursor)

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(
            async_return(None)
        )
        expect(cursor, times=1).fetchone().thenReturn(async_return(None))

        # ACT
        result = asyncio.run(repo.get_patient_details("NONEXISTENT"))

        # ASSERT
        assert result is None

    # ------------------------------------------------------------------ #
    # get_latest_visit_summary                                            #
    # ------------------------------------------------------------------ #

    def test_get_latest_visit_summary_returns_summary_when_row_exists(self) -> None:
        """
        Given the DB returns the most recent active session for the patient,
        When get_latest_visit_summary is called,
        Then a LatestVisitSummary instance with correct fields is returned.
        """
        # PREPARE
        cursor = mock()
        repo = PatientDetailsRepository(db=cursor)
        row = {
            "session_id": 42,
            "visit_date": datetime.date(2026, 5, 1),
            "visit_time": datetime.time(10, 30, 0),
            "visit_type": "PHYSIOTHERAPIST",
            "description": "Initial assessment",
            "therapist_name": "Dr. Ben Levi",
        }

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(
            async_return(None)
        )
        expect(cursor, times=1).fetchone().thenReturn(async_return(row))

        # ACT
        result = asyncio.run(repo.get_latest_visit_summary("P001"))

        # ASSERT
        assert result is not None
        assert result.session_id == 42
        assert result.visit_date == datetime.date(2026, 5, 1)
        assert result.visit_type == "PHYSIOTHERAPIST"
        assert result.therapist_name == "Dr. Ben Levi"
        assert result.description == "Initial assessment"

    def test_get_latest_visit_summary_returns_none_when_no_row(self) -> None:
        """
        Given the DB returns no active session for the patient,
        When get_latest_visit_summary is called,
        Then None is returned.
        """
        # PREPARE
        cursor = mock()
        repo = PatientDetailsRepository(db=cursor)

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(
            async_return(None)
        )
        expect(cursor, times=1).fetchone().thenReturn(async_return(None))

        # ACT
        result = asyncio.run(repo.get_latest_visit_summary("P001"))

        # ASSERT
        assert result is None

    # ------------------------------------------------------------------ #
    # get_current_plan_with_progress                                      #
    # ------------------------------------------------------------------ #

    def test_get_current_plan_returns_plan_when_physiotherapist(self) -> None:
        """
        Given the DB returns an active PHYSIOTHERAPIST plan row for the patient,
        When get_current_plan_with_progress is called with visit_type PHYSIOTHERAPIST,
        Then a CurrentPlanWithProgress instance is returned.
        """
        # PREPARE
        cursor = mock()
        repo = PatientDetailsRepository(db=cursor)
        row = {
            "plan_id": 7,
            "session_id": 42,
            "medical_diagnosis": "ACL tear",
            "start_date": datetime.date(2026, 5, 1),
            "end_date": datetime.date(2026, 8, 1),
            "progress_percentage": 34.5,
            "last_progress_update": datetime.date(2026, 5, 10),
        }

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(
            async_return(None)
        )
        expect(cursor, times=1).fetchone().thenReturn(async_return(row))

        # ACT
        result = asyncio.run(
            repo.get_current_plan_with_progress("P001", "PHYSIOTHERAPIST")
        )

        # ASSERT
        assert result is not None
        assert result.plan_id == 7
        assert result.session_id == 42
        assert result.medical_diagnosis == "ACL tear"
        assert result.progress_percentage == 34.5
        assert result.last_progress_update == datetime.date(2026, 5, 10)

    def test_get_current_plan_returns_plan_when_fitness(self) -> None:
        """
        Given the DB returns an active FITNESS plan row for the patient,
        When get_current_plan_with_progress is called with visit_type FITNESS,
        Then a CurrentPlanWithProgress instance with the FITNESS data is returned.
        """
        # PREPARE
        cursor = mock()
        repo = PatientDetailsRepository(db=cursor)
        row = {
            "plan_id": 12,
            "session_id": 55,
            "medical_diagnosis": "Knee strengthening",
            "start_date": datetime.date(2026, 4, 1),
            "end_date": datetime.date(2026, 7, 1),
            "progress_percentage": 0.0,
            "last_progress_update": None,
        }

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(
            async_return(None)
        )
        expect(cursor, times=1).fetchone().thenReturn(async_return(row))

        # ACT
        result = asyncio.run(
            repo.get_current_plan_with_progress("P001", "FITNESS")
        )

        # ASSERT
        assert result is not None
        assert result.plan_id == 12
        assert result.progress_percentage == 0.0
        assert result.last_progress_update is None

    def test_get_current_plan_returns_none_when_no_row(self) -> None:
        """
        Given the DB returns no active plan for the patient and visit type,
        When get_current_plan_with_progress is called,
        Then None is returned.
        """
        # PREPARE
        cursor = mock()
        repo = PatientDetailsRepository(db=cursor)

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(
            async_return(None)
        )
        expect(cursor, times=1).fetchone().thenReturn(async_return(None))

        # ACT
        result = asyncio.run(
            repo.get_current_plan_with_progress("P001", "PHYSIOTHERAPIST")
        )

        # ASSERT
        assert result is None
