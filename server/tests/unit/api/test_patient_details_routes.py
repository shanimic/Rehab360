"""Unit tests for patient details HTTP routes (DB dependency overridden with stub cursor)."""

import datetime
import unittest
from collections import deque

from fastapi.testclient import TestClient

from app.db.session import get_db
from app.main import app


class _PatientDetailsStubCursor:
    """Minimal async cursor stub for patient details tests.

    fetchone calls are served in order from the queue.
    Each request triggers four sequential fetchone calls:
      1. get_patient_details
      2. get_latest_visit_summary
      3. get_current_plan_with_progress (PHYSIOTHERAPIST)
      4. get_current_plan_with_progress (FITNESS)
    """

    def __init__(self, fetchone_rows: list) -> None:
        self._fetchone_queue: deque = deque(fetchone_rows)

    async def execute(self, *_args, **_kwargs) -> None:
        return None

    async def fetchone(self):
        return self._fetchone_queue.popleft() if self._fetchone_queue else None


class PatientDetailsRoutesTest(unittest.TestCase):
    def tearDown(self) -> None:
        app.dependency_overrides.clear()

    # ── GET /patient-details/{patient_id} ────────────────────────────────

    def test_returns_200_with_all_data(self) -> None:
        """
        Given all four DB queries return rows and viewer_role=PHYSIOTHERAPIST is passed,
        When GET /patient-details/{patient_id}?viewer_role=PHYSIOTHERAPIST is called,
        Then 200 is returned with complete patient, visit summary, treatment plan,
        fitness plan, and viewer_role.

        fetchone sequence:
          1. get_patient_details           → patient row
          2. get_latest_visit_summary      → visit row
          3. get_current_plan (PHYSIO)     → treatment plan row
          4. get_current_plan (FITNESS)    → fitness plan row
        """
        # PREPARE
        cursor = _PatientDetailsStubCursor(
            fetchone_rows=[
                {
                    "user_id": "P001",
                    "first_name": "Alice",
                    "last_name": "Cohen",
                    "phone": "050-1234567",
                    "birth_date": datetime.date(1990, 3, 15),
                    "email": "alice@example.com",
                },
                {
                    "session_id": 42,
                    "visit_date": datetime.date(2026, 5, 1),
                    "visit_time": datetime.time(10, 30, 0),
                    "visit_type": "PHYSIOTHERAPIST",
                    "description": "Initial assessment",
                    "therapist_name": "Dr. Ben Levi",
                },
                {
                    "plan_id": 7,
                    "session_id": 42,
                    "medical_diagnosis": "ACL tear",
                    "start_date": datetime.date(2026, 5, 1),
                    "end_date": datetime.date(2026, 8, 1),
                    "progress_percentage": 34.5,
                    "last_progress_update": datetime.date(2026, 5, 10),
                },
                {
                    "plan_id": 12,
                    "session_id": 55,
                    "medical_diagnosis": "Knee strengthening",
                    "start_date": datetime.date(2026, 4, 1),
                    "end_date": datetime.date(2026, 7, 1),
                    "progress_percentage": 0.0,
                    "last_progress_update": None,
                },
            ]
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get(
            "/patient-details/P001?viewer_role=PHYSIOTHERAPIST"
        )

        # ASSERT
        assert response.status_code == 200
        body = response.json()
        assert body["patient"]["user_id"] == "P001"
        assert body["patient"]["first_name"] == "Alice"
        assert body["latest_visit_summary"]["session_id"] == 42
        assert body["latest_visit_summary"]["therapist_name"] == "Dr. Ben Levi"
        assert body["treatment_plan"]["plan_id"] == 7
        assert body["treatment_plan"]["progress_percentage"] == 34.5
        assert body["fitness_plan"]["plan_id"] == 12
        assert body["fitness_plan"]["last_progress_update"] is None
        assert body["viewer_role"] == "PHYSIOTHERAPIST"

    def test_patient_not_found_returns_404(self) -> None:
        """
        Given the first DB query returns no patient row,
        When GET /patient-details/{patient_id} is called,
        Then 404 Not Found is returned.

        fetchone sequence:
          1. get_patient_details → None
        """
        # PREPARE
        cursor = _PatientDetailsStubCursor(fetchone_rows=[None])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get("/patient-details/NONEXISTENT")

        # ASSERT
        assert response.status_code == 404

    def test_returns_200_with_null_visit_summary(self) -> None:
        """
        Given the patient exists but has no active session,
        When GET /patient-details/{patient_id} is called,
        Then 200 is returned and latest_visit_summary is null.

        fetchone sequence:
          1. get_patient_details      → patient row
          2. get_latest_visit_summary → None
          3. get_current_plan (PHYSIO) → treatment plan row
          4. get_current_plan (FITNESS) → None
        """
        # PREPARE
        cursor = _PatientDetailsStubCursor(
            fetchone_rows=[
                {
                    "user_id": "P001",
                    "first_name": "Alice",
                    "last_name": "Cohen",
                    "phone": "050-1234567",
                    "birth_date": datetime.date(1990, 3, 15),
                    "email": "alice@example.com",
                },
                None,
                {
                    "plan_id": 7,
                    "session_id": 42,
                    "medical_diagnosis": "ACL tear",
                    "start_date": datetime.date(2026, 5, 1),
                    "end_date": datetime.date(2026, 8, 1),
                    "progress_percentage": 20.0,
                    "last_progress_update": None,
                },
                None,
            ]
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get("/patient-details/P001")

        # ASSERT
        assert response.status_code == 200
        body = response.json()
        assert body["latest_visit_summary"] is None
        assert body["treatment_plan"]["plan_id"] == 7
        assert body["fitness_plan"] is None

    def test_returns_200_with_null_plans(self) -> None:
        """
        Given the patient exists with a visit but no active plans,
        When GET /patient-details/{patient_id} is called,
        Then 200 is returned with both treatment_plan and fitness_plan as null.

        fetchone sequence:
          1. get_patient_details          → patient row
          2. get_latest_visit_summary     → visit row
          3. get_current_plan (PHYSIO)    → None
          4. get_current_plan (FITNESS)   → None
        """
        # PREPARE
        cursor = _PatientDetailsStubCursor(
            fetchone_rows=[
                {
                    "user_id": "P001",
                    "first_name": "Alice",
                    "last_name": "Cohen",
                    "phone": "050-1234567",
                    "birth_date": datetime.date(1990, 3, 15),
                    "email": "alice@example.com",
                },
                {
                    "session_id": 42,
                    "visit_date": datetime.date(2026, 5, 1),
                    "visit_time": datetime.time(10, 30, 0),
                    "visit_type": "PHYSIOTHERAPIST",
                    "description": "Follow-up",
                    "therapist_name": "Dr. Avi Katz",
                },
                None,
                None,
            ]
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get("/patient-details/P001")

        # ASSERT
        assert response.status_code == 200
        body = response.json()
        assert body["latest_visit_summary"]["session_id"] == 42
        assert body["treatment_plan"] is None
        assert body["fitness_plan"] is None

    def test_invalid_viewer_role_returns_422(self) -> None:
        """
        Given an unrecognised viewer_role value is provided,
        When GET /patient-details/{patient_id}?viewer_role=INVALID is called,
        Then 422 Unprocessable Entity is returned (FastAPI enum validation).
        """
        # PREPARE
        cursor = _PatientDetailsStubCursor(fetchone_rows=[])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get("/patient-details/P001?viewer_role=INVALID_ROLE")

        # ASSERT
        assert response.status_code == 422
