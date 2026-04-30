"""Unit tests for ProfileRepository (mocked cursor)."""

import asyncio
import datetime
import unittest

from mockito import ANY, expect, mock

from app.dal.profile_repository import ProfileRepository
from tests.unit.async_helpers import async_return


class ProfileRepositoryTest(unittest.TestCase):

    # ------------------------------------------------------------------ #
    # get_profile_data                                                     #
    # ------------------------------------------------------------------ #

    def test_get_profile_data_returns_profile_when_row_exists(self) -> None:
        """
        Given the DB returns a matching row for the user_id,
        When get_profile_data is called,
        Then a ProfileData instance is built from that row.
        """
        # PREPARE
        cursor = mock()
        repo = ProfileRepository(db=cursor)
        row = {
            "last_name": "Smith",
            "email": "smith@test.com",
            "phone": "050-0000001",
            "birth_date": datetime.date(1990, 1, 1),
            "license_number": None,
        }

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(async_return(None))
        expect(cursor, times=1).fetchone().thenReturn(async_return(row))

        # ACT
        result = asyncio.run(repo.get_profile_data("user-001"))

        # ASSERT
        assert result is not None
        assert result.last_name == "Smith"
        assert result.email == "smith@test.com"
        assert result.license_number is None

    def test_get_profile_data_returns_none_when_no_row(self) -> None:
        """
        Given the DB returns no row for the user_id,
        When get_profile_data is called,
        Then None is returned.
        """
        # PREPARE
        cursor = mock()
        repo = ProfileRepository(db=cursor)

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(async_return(None))
        expect(cursor, times=1).fetchone().thenReturn(async_return(None))

        # ACT
        result = asyncio.run(repo.get_profile_data("ghost-001"))

        # ASSERT
        assert result is None

    # ------------------------------------------------------------------ #
    # get_active_patient_plans                                             #
    # ------------------------------------------------------------------ #

    def test_get_active_patient_plans_returns_plans_when_rows_exist(self) -> None:
        """
        Given the DB returns plan rows for the patient,
        When get_active_patient_plans is called,
        Then a list of ActivePlan instances is returned.
        """
        # PREPARE
        cursor = mock()
        repo = ProfileRepository(db=cursor)
        rows = [
            {
                "plan_id": 1,
                "goal": "Recover knee",
                "category": "PHYSIOTHERAPY",
                "start_date": datetime.date(2026, 1, 1),
                "end_date": datetime.date(2026, 3, 1),
                "completion_percent": 50.0,
            }
        ]

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(async_return(None))
        expect(cursor, times=1).fetchall().thenReturn(async_return(rows))

        # ACT
        result = asyncio.run(repo.get_active_patient_plans("patient-001"))

        # ASSERT
        assert len(result) == 1
        assert result[0].plan_id == 1
        assert result[0].goal == "Recover knee"
        assert result[0].completion_percent == 50.0

    def test_get_active_patient_plans_returns_empty_list_when_no_rows(self) -> None:
        """
        Given the patient has no active plans in the DB,
        When get_active_patient_plans is called,
        Then an empty list is returned.
        """
        # PREPARE
        cursor = mock()
        repo = ProfileRepository(db=cursor)

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(async_return(None))
        expect(cursor, times=1).fetchall().thenReturn(async_return([]))

        # ACT
        result = asyncio.run(repo.get_active_patient_plans("patient-002"))

        # ASSERT
        assert result == []
