"""Unit tests for TreatmentPlanRepository (mocked cursor)."""

import asyncio
import datetime
import unittest

from mockito import ANY, expect, mock

from app.dal.treatment_plan_repository import TreatmentPlanRepository
from tests.unit.async_helpers import async_return


class TreatmentPlanRepositoryTest(unittest.TestCase):

    # ------------------------------------------------------------------ #
    # get_treatment_plan_by_plan_id                                        #
    # ------------------------------------------------------------------ #

    def test_get_treatment_plan_by_plan_id_returns_details_when_row_exists(
        self,
    ) -> None:
        """
        Given the DB returns a matching row for the plan_id,
        When get_treatment_plan_by_plan_id is called,
        Then a TreatmentPlanDetailsResponse with exercises=[] is returned.
        """
        # PREPARE
        cursor = mock()
        repo = TreatmentPlanRepository(db=cursor)
        row = {
            "plan_id": 6,
            "session_id": 103,
            "medical_diagnosis": "Shoulder Impingement",
            "goal": "Restore full range of motion",
            "start_date": datetime.date(2025, 1, 6),
            "end_date": datetime.date(2025, 3, 1),
            "notes": None,
        }

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(
            async_return(None)
        )
        expect(cursor, times=1).fetchone().thenReturn(async_return(row))

        # ACT
        result = asyncio.run(repo.get_treatment_plan_by_plan_id(6))

        # ASSERT
        assert result is not None
        assert result.plan_id == 6
        assert result.session_id == 103
        assert result.medical_diagnosis == "Shoulder Impingement"
        assert result.goal == "Restore full range of motion"
        assert result.notes is None
        assert result.exercises == []

    def test_get_treatment_plan_by_plan_id_returns_none_when_no_row(self) -> None:
        """
        Given the DB returns no row for the plan_id,
        When get_treatment_plan_by_plan_id is called,
        Then None is returned.
        """
        # PREPARE
        cursor = mock()
        repo = TreatmentPlanRepository(db=cursor)

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(
            async_return(None)
        )
        expect(cursor, times=1).fetchone().thenReturn(async_return(None))

        # ACT
        result = asyncio.run(repo.get_treatment_plan_by_plan_id(9999))

        # ASSERT
        assert result is None

    # ------------------------------------------------------------------ #
    # get_exercises_by_plan                                                #
    # ------------------------------------------------------------------ #

    def test_get_exercises_by_plan_returns_list_when_rows_exist(self) -> None:
        """
        Given the DB returns exercise rows for the plan,
        When get_exercises_by_plan is called,
        Then a list of TreatmentPlanExerciseItem instances is returned.
        """
        # PREPARE
        cursor = mock()
        repo = TreatmentPlanRepository(db=cursor)
        rows = [
            {
                "exercise_id": 1,
                "exercise_name": "Wall Squats",
                "reps": 12,
                "num_sets": 3,
                "weight": None,
                "time_duration": 3,
                "time_unit": "Weekly",
                "description": None,
            },
            {
                "exercise_id": 2,
                "exercise_name": "Hip Bridge",
                "reps": 15,
                "num_sets": 3,
                "weight": None,
                "time_duration": 5,
                "time_unit": "Weekly",
                "description": "Keep core tight",
            },
        ]

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(
            async_return(None)
        )
        expect(cursor, times=1).fetchall().thenReturn(async_return(rows))

        # ACT
        result = asyncio.run(repo.get_exercises_by_plan(6, 103))

        # ASSERT
        assert len(result) == 2
        assert result[0].exercise_id == 1
        assert result[0].exercise_name == "Wall Squats"
        assert result[0].num_sets == 3
        assert result[0].weight is None
        assert result[1].exercise_name == "Hip Bridge"
        assert result[1].description == "Keep core tight"

    def test_get_exercises_by_plan_returns_empty_list_when_no_rows(self) -> None:
        """
        Given the DB returns no exercise rows for the plan,
        When get_exercises_by_plan is called,
        Then an empty list is returned.
        """
        # PREPARE
        cursor = mock()
        repo = TreatmentPlanRepository(db=cursor)

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(
            async_return(None)
        )
        expect(cursor, times=1).fetchall().thenReturn(async_return([]))

        # ACT
        result = asyncio.run(repo.get_exercises_by_plan(6, 103))

        # ASSERT
        assert result == []
