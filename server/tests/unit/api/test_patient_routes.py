"""Unit tests for patient HTTP routes (DB dependency overridden with stub cursor)."""

import unittest
from collections import deque

from fastapi.testclient import TestClient

from app.db.session import get_db
from app.main import app


class _PatientHomeStubCursor:
    """Minimal async cursor: fetchone order is fixed (mockito cannot disambiguate bare fetchone())."""

    def __init__(self, fetchall_rows: list, fetchone_rows: list) -> None:
        self._fetchall_rows = fetchall_rows
        self._fetchone_queue: deque = deque(fetchone_rows)

    async def execute(self, **_kwargs) -> None:
        return None

    async def fetchall(self) -> list:
        return self._fetchall_rows

    async def fetchone(self):
        return self._fetchone_queue.popleft() if self._fetchone_queue else None


class PatientRoutesTest(unittest.TestCase):
    def tearDown(self) -> None:
        app.dependency_overrides.clear()

    def test_get_patient_home_success_returns_payload(self) -> None:
        """
        Given stubbed DB rows for daily exercises, weekly completion, and percentages,
        When GET /patient/home/{patient_id} is called,
        Then 200 is returned with matching JSON and daily_completions derived from exercises.
        """
        # PREPARE
        patient_id = "patient-001"
        daily_rows = [
            {
                "exercise_id": 1,
                "exercise_name": "Squat",
                "visit_type": "FITNESS",
                "reps": 10,
                "execution_status": 1,
                "execution_date": "2026-04-18",
            },
            {
                "exercise_id": 2,
                "exercise_name": "Stretch",
                "visit_type": "PHYSIOTHERAPIST",
                "reps": 5,
                "execution_status": 0,
                "execution_date": "2026-04-18",
            },
        ]
        cursor = _PatientHomeStubCursor(
            fetchall_rows=daily_rows,
            fetchone_rows=[
                {"EXECOMP": 3, "EXETDW": 12},
                {"FITNESS_PERCENTAGE": 42.5},
                {"PHYSIOTHERAPIST_PERCENTAGE": 88.0},
            ],
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get(f"/patient/home/{patient_id}")

        # ASSERT
        assert response.status_code == 200
        body = response.json()
        assert len(body["daily_exercises"]) == 2
        assert body["daily_exercises"][0]["exercise_name"] == "Squat"
        assert body["daily_exercises"][0]["execution_status"] is True
        assert body["daily_exercises"][1]["execution_status"] is False
        assert body["weekly_completion"]["EXECOMP"] == 3
        assert body["weekly_completion"]["EXETDW"] == 12
        assert body["fitness_percentage"] == 42.5
        assert body["physiotherapist_percentage"] == 88.0
        assert body["daily_completions"]["completed_sum"] == 1
        assert body["daily_completions"]["total"] == 2

    def test_get_patient_home_empty_daily_exercises_still_returns_200(self) -> None:
        """
        Given no daily exercise rows from the DB,
        When GET /patient/home/{patient_id} is called,
        Then 200 is returned with empty daily_exercises and zero daily_completions.
        """
        # PREPARE
        patient_id = "patient-empty"
        cursor = _PatientHomeStubCursor(
            fetchall_rows=[],
            fetchone_rows=[
                {"EXECOMP": 0, "EXETDW": 5},
                {"FITNESS_PERCENTAGE": 0.0},
                {"PHYSIOTHERAPIST_PERCENTAGE": 0.0},
            ],
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get(f"/patient/home/{patient_id}")

        # ASSERT
        assert response.status_code == 200
        body = response.json()
        assert body["daily_exercises"] == []
        assert body["daily_completions"]["completed_sum"] == 0
        assert body["daily_completions"]["total"] == 0
        assert body["weekly_completion"]["EXECOMP"] == 0
        assert body["weekly_completion"]["EXETDW"] == 5
