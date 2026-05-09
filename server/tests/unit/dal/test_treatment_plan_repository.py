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
            "visit_type": "PHYSIOTHERAPIST",
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
        assert result.visit_type == "PHYSIOTHERAPIST"
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

    # ------------------------------------------------------------------ #
    # plan_exists                                                          #
    # ------------------------------------------------------------------ #

    def test_plan_exists_returns_true_when_row_found(self) -> None:
        """
        Given the DB returns a plan row for the session_id,
        When plan_exists is called,
        Then True is returned.
        """
        # PREPARE
        cursor = mock()
        repo = TreatmentPlanRepository(db=cursor)

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(
            async_return(None)
        )
        expect(cursor, times=1).fetchone().thenReturn(async_return({"plan_id": 5}))

        # ACT
        result = asyncio.run(repo.plan_exists(42))

        # ASSERT
        assert result is True

    def test_plan_exists_returns_false_when_no_row(self) -> None:
        """
        Given the DB returns no plan row for the session_id,
        When plan_exists is called,
        Then False is returned.
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
        result = asyncio.run(repo.plan_exists(9999))

        # ASSERT
        assert result is False

    # ------------------------------------------------------------------ #
    # get_valid_exercise_ids                                               #
    # ------------------------------------------------------------------ #

    def test_get_valid_exercise_ids_returns_empty_for_empty_input(self) -> None:
        """
        Given an empty exercise_ids list is provided,
        When get_valid_exercise_ids is called,
        Then [] is returned immediately without querying the DB.
        """
        # PREPARE — no cursor expectations: any cursor call would raise
        cursor = mock()
        repo = TreatmentPlanRepository(db=cursor)

        # ACT
        result = asyncio.run(repo.get_valid_exercise_ids([], "PHYSIOTHERAPIST"))

        # ASSERT
        assert result == []

    def test_get_valid_exercise_ids_returns_all_ids_when_all_match(self) -> None:
        """
        Given all requested exercise IDs exist and match the visit_type,
        When get_valid_exercise_ids is called,
        Then all IDs are returned.
        """
        # PREPARE
        cursor = mock()
        repo = TreatmentPlanRepository(db=cursor)

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(
            async_return(None)
        )
        expect(cursor, times=1).fetchall().thenReturn(
            async_return([{"exercise_id": 1}, {"exercise_id": 2}])
        )

        # ACT
        result = asyncio.run(repo.get_valid_exercise_ids([1, 2], "PHYSIOTHERAPIST"))

        # ASSERT
        assert result == [1, 2]

    def test_get_valid_exercise_ids_returns_empty_when_none_match_visit_type(
        self,
    ) -> None:
        """
        Given the requested exercise IDs belong to a different visit_type,
        When get_valid_exercise_ids is called with the wrong visit_type,
        Then an empty list is returned.
        """
        # PREPARE
        cursor = mock()
        repo = TreatmentPlanRepository(db=cursor)

        # MOCK — DB returns nothing because IDs 5,6 are FITNESS, not PHYSIOTHERAPIST
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(
            async_return(None)
        )
        expect(cursor, times=1).fetchall().thenReturn(async_return([]))

        # ACT
        result = asyncio.run(repo.get_valid_exercise_ids([5, 6], "PHYSIOTHERAPIST"))

        # ASSERT
        assert result == []

    # ------------------------------------------------------------------ #
    # get_exercises_by_visit_type — FITNESS branch                        #
    # ------------------------------------------------------------------ #

    def test_get_exercises_by_visit_type_returns_fitness_list(self) -> None:
        """
        Given the DB returns exercise rows with visit_type FITNESS,
        When get_exercises_by_visit_type is called with 'FITNESS',
        Then a list of PhysiotherapyExerciseItem instances is returned.
        """
        # PREPARE
        cursor = mock()
        repo = TreatmentPlanRepository(db=cursor)
        rows = [
            {"exercise_id": 5, "exercise_name": "Wall Squats"},
            {"exercise_id": 6, "exercise_name": "Plank"},
        ]

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(
            async_return(None)
        )
        expect(cursor, times=1).fetchall().thenReturn(async_return(rows))

        # ACT
        result = asyncio.run(repo.get_exercises_by_visit_type("FITNESS"))

        # ASSERT
        assert len(result) == 2
        assert result[0].exercise_id == 5
        assert result[0].exercise_name == "Wall Squats"
        assert result[1].exercise_id == 6

    # ------------------------------------------------------------------ #
    # get_treatment_plan_context — FITNESS branch                         #
    # ------------------------------------------------------------------ #

    def test_get_treatment_plan_context_returns_fitness_context(self) -> None:
        """
        Given the DB returns a row with visit_type FITNESS,
        When get_treatment_plan_context is called,
        Then a TreatmentPlanContext with visit_type FITNESS is returned.
        """
        # PREPARE
        cursor = mock()
        repo = TreatmentPlanRepository(db=cursor)
        row = {
            "session_id": 55,
            "medical_diagnosis": "Lower back strain",
            "visit_type": "FITNESS",
        }

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(
            async_return(None)
        )
        expect(cursor, times=1).fetchone().thenReturn(async_return(row))

        # ACT
        result = asyncio.run(repo.get_treatment_plan_context(55))

        # ASSERT
        assert result is not None
        assert result.session_id == 55
        assert result.visit_type == "FITNESS"
        assert result.medical_diagnosis == "Lower back strain"

    # ------------------------------------------------------------------ #
    # get_treatment_plan_by_plan_id — FITNESS visit_type                  #
    # ------------------------------------------------------------------ #

    def test_get_treatment_plan_by_plan_id_returns_fitness_visit_type(self) -> None:
        """
        Given the DB returns a plan row where the session has visit_type FITNESS,
        When get_treatment_plan_by_plan_id is called,
        Then the returned TreatmentPlanDetailsResponse has visit_type FITNESS.
        """
        # PREPARE
        cursor = mock()
        repo = TreatmentPlanRepository(db=cursor)
        row = {
            "plan_id": 20,
            "session_id": 77,
            "medical_diagnosis": "Knee strengthening",
            "visit_type": "FITNESS",
            "goal": "Build lower body strength",
            "start_date": datetime.date(2026, 5, 1),
            "end_date": datetime.date(2026, 8, 1),
            "notes": None,
        }

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(
            async_return(None)
        )
        expect(cursor, times=1).fetchone().thenReturn(async_return(row))

        # ACT
        result = asyncio.run(repo.get_treatment_plan_by_plan_id(20))

        # ASSERT
        assert result is not None
        assert result.visit_type == "FITNESS"
        assert result.plan_id == 20
        assert result.exercises == []
