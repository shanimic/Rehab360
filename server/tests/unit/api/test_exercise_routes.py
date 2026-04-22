"""Unit tests for exercise HTTP routes (DB dependency overridden with stub cursor)."""

import unittest

from fastapi.testclient import TestClient

from app.db.session import get_db
from app.main import app


class _ExerciseStubCursor:
    """Minimal async cursor that returns a fixed fetchall result."""

    def __init__(self, fetchall_rows: list) -> None:
        self._fetchall_rows = fetchall_rows

    async def execute(self, **_kwargs) -> None:
        return None

    async def fetchall(self) -> list:
        return self._fetchall_rows


def _make_exercise_row(**overrides) -> dict:
    defaults = {
        "exercise_id": 1,
        "exercise_name": "Squat",
        "visit_type": "PHYSIOTHERAPIST",
        "reps": 10,
        "execution_status": 0,
        "ex_video_url": "https://example.com/squat.mp4",
        "text_instructions": "Keep back straight.",
        "session_id": 5,
        "weekly_plan_id": 12,
        "plan_id": 3,
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
                session_id=6,
                weekly_plan_id=13,
                plan_id=4,
            ),
        ]
        cursor = _ExerciseStubCursor(fetchall_rows=rows)

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get(f"/exercise/{patient_id}")

        # ASSERT
        assert response.status_code == 200
        body = response.json()
        assert len(body) == 2

        first = body[0]
        assert first["exercise_id"] == 1
        assert first["exercise_name"] == "Squat"
        assert first["visit_type"] == "PHYSIOTHERAPIST"
        assert first["reps"] == 10
        assert first["execution_status"] is True
        assert first["ex_video_url"] == "https://example.com/squat.mp4"
        assert first["text_instructions"] == "Keep back straight."
        assert first["session_id"] == 5
        assert first["weekly_plan_id"] == 12
        assert first["plan_id"] == 3

        second = body[1]
        assert second["exercise_id"] == 2
        assert second["exercise_name"] == "Lunge"
        assert second["visit_type"] == "FITNESS"
        assert second["reps"] == 15
        assert second["execution_status"] is False

    def test_get_patient_plan_empty_plan_returns_empty_list(self) -> None:
        """
        Given no exercise rows exist for the patient today,
        When GET /exercise/{patient_id} is called,
        Then 200 is returned with an empty JSON array.
        """
        # PREPARE
        patient_id = "patient-no-plan"
        cursor = _ExerciseStubCursor(fetchall_rows=[])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get(f"/exercise/{patient_id}")

        # ASSERT
        assert response.status_code == 200
        assert response.json() == []

    def test_get_patient_plan_execution_status_tinyint_coerced_to_bool(self) -> None:
        """
        Given a DB row with execution_status as tinyint 1,
        When GET /exercise/{patient_id} is called,
        Then the response contains execution_status as boolean True.
        """
        # PREPARE
        patient_id = "patient-002"
        cursor = _ExerciseStubCursor(
            fetchall_rows=[_make_exercise_row(execution_status=1)]
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get(f"/exercise/{patient_id}")

        # ASSERT
        assert response.status_code == 200
        assert response.json()[0]["execution_status"] is True
