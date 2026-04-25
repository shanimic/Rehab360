"""Unit tests for exercise HTTP routes (DB dependency overridden with stub cursor)."""

import unittest

from fastapi.testclient import TestClient

from app.db.session import get_db
from app.main import app


class _ExerciseStubCursor:
    """Minimal async cursor that returns fixed fetchall results across sequential calls."""

    def __init__(self, today_rows: list, tomorrow_rows: list | None = None) -> None:
        self._responses = [today_rows, tomorrow_rows if tomorrow_rows is not None else []]
        self._call_count = 0

    async def execute(self, **_kwargs) -> None:
        return None

    async def fetchall(self) -> list:
        result = self._responses[self._call_count % len(self._responses)]
        self._call_count += 1
        return result


def _make_exercise_row(**overrides) -> dict:
    defaults = {
        "exercise_id": 1,
        "exercise_name": "Squat",
        "visit_type": "PHYSIOTHERAPIST",
        "reps": 10,
        "execution_status": 0,
        "num_sets": 3,
        "text_instructions": "Keep back straight.",
    }
    defaults.update(overrides)
    return defaults


class ExerciseRoutesTest(unittest.TestCase):
    def tearDown(self) -> None:
        app.dependency_overrides.clear()

    def test_get_patient_plan_returns_list_of_exercises(self) -> None:
        """
        Given two exercise rows exist for the patient's active plan today,
        When GET /exercise/{patient_id} is called,
        Then 200 is returned with a JSON array of two exercises with correct field values.
        """
        # PREPARE
        patient_id = "patient-001"
        rows = [
            _make_exercise_row(exercise_id=1, exercise_name="Squat", execution_status=1),
            _make_exercise_row(
                exercise_id=2,
                exercise_name="Lunge",
                visit_type="FITNESS",
                reps=15,
                execution_status=0,
                num_sets=5,
            ),
        ]
        cursor = _ExerciseStubCursor(today_rows=rows)

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get(f"/exercise/{patient_id}")

        # ASSERT
        assert response.status_code == 200
        body = response.json()
        today = body["today_exercises"]
        assert len(today) == 2

        first = today[0]
        assert first["exercise_id"] == 1
        assert first["exercise_name"] == "Squat"
        assert first["visit_type"] == "PHYSIOTHERAPIST"
        assert first["reps"] == 10
        assert first["execution_status"] is True
        assert first["num_sets"] == 3
        assert first["text_instructions"] == "Keep back straight."

        second = today[1]
        assert second["exercise_id"] == 2
        assert second["exercise_name"] == "Lunge"
        assert second["visit_type"] == "FITNESS"
        assert second["reps"] == 15
        assert second["execution_status"] is False
        assert second["num_sets"] == 5

    def test_get_patient_plan_empty_plan_returns_empty_list(self) -> None:
        """
        Given no exercise rows exist for the patient today,
        When GET /exercise/{patient_id} is called,
        Then 200 is returned with an empty JSON array.
        """
        # PREPARE
        patient_id = "patient-no-plan"
        cursor = _ExerciseStubCursor(today_rows=[])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get(f"/exercise/{patient_id}")

        # ASSERT
        assert response.status_code == 200
        assert response.json() == {"today_exercises": [], "tomorrow_exercises": []}

    def test_get_patient_plan_execution_status_tinyint_coerced_to_bool(self) -> None:
        """
        Given a DB row with execution_status as tinyint 1,
        When GET /exercise/{patient_id} is called,
        Then the response contains execution_status as boolean True.
        """
        # PREPARE
        patient_id = "patient-002"
        cursor = _ExerciseStubCursor(
            today_rows=[_make_exercise_row(execution_status=1)]
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get(f"/exercise/{patient_id}")

        # ASSERT
        assert response.status_code == 200
        assert response.json()["today_exercises"][0]["execution_status"] is True
