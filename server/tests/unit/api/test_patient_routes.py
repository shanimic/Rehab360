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
                "num_sets": 3,
                "text_instructions": "Stand with feet shoulder-width apart.",
            },
            {
                "exercise_id": 2,
                "exercise_name": "Stretch",
                "visit_type": "PHYSIOTHERAPIST",
                "reps": 5,
                "execution_status": 0,
                "num_sets": 2,
                "text_instructions": "Hold each stretch for 30 seconds.",
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

    def test_get_weekly_schedule_returns_list_of_exercises(self) -> None:
        """
        Given stubbed DB rows for the patient's active weekly plan,
        When GET /patient/weekly-schedule/{patient_id} is called,
        Then 200 is returned with a list of exercise items matching the DB rows.
        """
        # PREPARE
        patient_id = "patient-001"
        schedule_rows = [
            {
                "exercise_id": 1,
                "exercise_name": "Squat",
                "visit_type": "FITNESS",
                "reps": 10,
                "num_sets": 3,
                "time_duration": 4,
                "time_unit": "Weekly",
                "session_id": 10,
                "plan_id": 5,
            },
            {
                "exercise_id": 2,
                "exercise_name": "Shoulder Stretch",
                "visit_type": "PHYSIOTHERAPIST",
                "reps": 15,
                "num_sets": 2,
                "time_duration": 7,
                "time_unit": "Daily",
                "session_id": 11,
                "plan_id": 6,
            },
        ]
        cursor = _PatientHomeStubCursor(fetchall_rows=schedule_rows, fetchone_rows=[])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get(f"/patient/weekly-schedule/{patient_id}")

        # ASSERT
        assert response.status_code == 200
        body = response.json()
        assert len(body) == 2
        assert body[0]["exercise_id"] == 1
        assert body[0]["exercise_name"] == "Squat"
        assert body[0]["visit_type"] == "FITNESS"
        assert body[0]["session_id"] == 10
        assert body[0]["plan_id"] == 5
        assert body[1]["exercise_name"] == "Shoulder Stretch"

    def test_get_weekly_schedule_empty_returns_empty_list(self) -> None:
        """
        Given no active plan exercises in the DB,
        When GET /patient/weekly-schedule/{patient_id} is called,
        Then 200 is returned with an empty list.
        """
        # PREPARE
        patient_id = "patient-no-plan"
        cursor = _PatientHomeStubCursor(fetchall_rows=[], fetchone_rows=[])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get(f"/patient/weekly-schedule/{patient_id}")

        # ASSERT
        assert response.status_code == 200
        assert response.json() == []

    def test_save_weekly_schedule_reminders_enabled_returns_200(self) -> None:
        """
        Given a valid payload with reminders enabled and full reminder date/time,
        When POST /patient/weekly-schedule/{patient_id} is called,
        Then 200 is returned.
        """
        # PREPARE
        patient_id = "patient-001"
        payload = {
            "reminders_enabled": True,
            "schedule": [
                {
                    "exercise_id": 1,
                    "day_index": 1,
                    "sets": 3,
                    "reminder_date": "2026-05-05",
                    "reminder_time": "09:00",
                    "session_id": 10,
                    "plan_id": 5,
                }
            ],
        }
        cursor = _PatientHomeStubCursor(fetchall_rows=[], fetchone_rows=[])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.post(f"/patient/weekly-schedule/{patient_id}", json=payload)

        # ASSERT
        assert response.status_code == 200

    def test_save_weekly_schedule_reminders_disabled_null_dates_returns_200(self) -> None:
        """
        Given a valid payload with reminders disabled and null reminder date/time,
        When POST /patient/weekly-schedule/{patient_id} is called,
        Then 200 is returned and null reminder fields are accepted.
        """
        # PREPARE
        patient_id = "patient-001"
        payload = {
            "reminders_enabled": False,
            "schedule": [
                {
                    "exercise_id": 2,
                    "day_index": 3,
                    "sets": 2,
                    "reminder_date": None,
                    "reminder_time": None,
                    "session_id": 11,
                    "plan_id": 6,
                }
            ],
        }
        cursor = _PatientHomeStubCursor(fetchall_rows=[], fetchone_rows=[])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.post(f"/patient/weekly-schedule/{patient_id}", json=payload)

        # ASSERT
        assert response.status_code == 200

    def test_save_weekly_schedule_missing_required_field_returns_422(self) -> None:
        """
        Given a payload missing the required reminders_enabled field,
        When POST /patient/weekly-schedule/{patient_id} is called,
        Then 422 Unprocessable Entity is returned.
        """
        # PREPARE
        patient_id = "patient-001"
        payload = {
            "schedule": [
                {
                    "exercise_id": 1,
                    "day_index": 0,
                    "sets": 1,
                    "reminder_date": None,
                    "reminder_time": None,
                }
            ]
        }
        cursor = _PatientHomeStubCursor(fetchall_rows=[], fetchone_rows=[])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.post(f"/patient/weekly-schedule/{patient_id}", json=payload)

        # ASSERT
        assert response.status_code == 422
