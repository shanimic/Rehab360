"""Unit tests for treatment plan HTTP routes (DB dependency overridden with stub cursor)."""

import datetime
import unittest
from collections import deque

from fastapi.testclient import TestClient

from app.db.session import get_db
from app.main import app


class _TreatmentPlanStubCursor:
    """Minimal async cursor stub for treatment plan tests."""

    def __init__(
        self,
        fetchone_rows: list,
        fetchall_rows: list | None = None,
    ) -> None:
        self._fetchone_queue: deque = deque(fetchone_rows)
        self._fetchall_rows: list = fetchall_rows if fetchall_rows is not None else []

    async def execute(self, *_args, **_kwargs) -> None:
        return None

    async def fetchone(self):
        return self._fetchone_queue.popleft() if self._fetchone_queue else None

    async def fetchall(self) -> list:
        return self._fetchall_rows


class TreatmentPlanRoutesTest(unittest.TestCase):
    def tearDown(self) -> None:
        app.dependency_overrides.clear()

    # ── GET /treatment-plan/context/{session_id} ─────────────────────────

    def test_get_context_found_returns_200(self) -> None:
        """
        Given an active PHYSIOTHERAPIST session row exists in the DB,
        When GET /treatment-plan/context/{session_id} is called,
        Then 200 is returned with session_id, medical_diagnosis, and visit_type.
        """
        # PREPARE
        cursor = _TreatmentPlanStubCursor(
            fetchone_rows=[
                {
                    "session_id": 42,
                    "medical_diagnosis": "ACL tear",
                    "visit_type": "PHYSIOTHERAPIST",
                }
            ]
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get("/treatment-plan/context/42")

        # ASSERT
        assert response.status_code == 200
        body = response.json()
        assert body["session_id"] == 42
        assert body["medical_diagnosis"] == "ACL tear"
        assert body["visit_type"] == "PHYSIOTHERAPIST"

    def test_get_context_not_found_returns_404(self) -> None:
        """
        Given no active session row matches the given session_id,
        When GET /treatment-plan/context/{session_id} is called,
        Then 404 Not Found is returned.
        """
        # PREPARE
        cursor = _TreatmentPlanStubCursor(fetchone_rows=[None])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get("/treatment-plan/context/9999")

        # ASSERT
        assert response.status_code == 404

    def test_get_context_non_physiotherapist_returns_400(self) -> None:
        """
        Given the session has visit_type FITNESS,
        When GET /treatment-plan/context/{session_id} is called,
        Then 400 Bad Request is returned.
        """
        # PREPARE
        cursor = _TreatmentPlanStubCursor(
            fetchone_rows=[
                {
                    "session_id": 55,
                    "medical_diagnosis": "Lower back strain",
                    "visit_type": "FITNESS",
                }
            ]
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get("/treatment-plan/context/55")

        # ASSERT
        assert response.status_code == 400

    # ── GET /treatment-plan/exercises ─────────────────────────────────────

    def test_get_physiotherapy_exercises_returns_list(self) -> None:
        """
        Given two PHYSIOTHERAPIST exercise rows exist in the DB,
        When GET /treatment-plan/exercises is called,
        Then 200 is returned with a list of two items.
        """
        # PREPARE
        cursor = _TreatmentPlanStubCursor(
            fetchone_rows=[],
            fetchall_rows=[
                {"exercise_id": 1, "exercise_name": "Curl"},
                {"exercise_id": 2, "exercise_name": "Press"},
            ],
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get("/treatment-plan/exercises")

        # ASSERT
        assert response.status_code == 200
        body = response.json()
        assert len(body) == 2
        assert body[0]["exercise_id"] == 1
        assert body[0]["exercise_name"] == "Curl"
        assert body[1]["exercise_id"] == 2

    # ── POST /treatment-plan/{session_id} ─────────────────────────────────

    def test_create_treatment_plan_success(self) -> None:
        """
        Given a valid PHYSIOTHERAPIST session with no existing plan and valid exercises,
        When POST /treatment-plan/42 is called with a complete request body,
        Then 200 is returned with the new plan_id and session_id.

        fetchone sequence:
          1. get_treatment_plan_context → PHYSIOTHERAPIST context row
          2. plan_exists → None  (no existing plan)
          3. LAST_INSERT_ID → {plan_id: 10}
        fetchall: valid exercise IDs [1, 2]
        """
        # PREPARE
        cursor = _TreatmentPlanStubCursor(
            fetchone_rows=[
                {
                    "session_id": 42,
                    "medical_diagnosis": "ACL tear",
                    "visit_type": "PHYSIOTHERAPIST",
                },
                None,
                {"plan_id": 10},
            ],
            fetchall_rows=[{"exercise_id": 1}, {"exercise_id": 2}],
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.post(
            "/treatment-plan/42",
            json={
                "goal": "Restore range of motion",
                "start_date": "2026-05-01",
                "end_date": "2026-07-01",
                "exercises": [
                    {
                        "exercise_id": 1,
                        "reps": 10,
                        "num_sets": 3,
                        "weight": 0.0,
                        "time_duration": 30,
                        "time_unit": "seconds",
                    },
                    {
                        "exercise_id": 2,
                        "reps": 12,
                        "num_sets": 3,
                        "weight": 5.0,
                        "time_duration": 45,
                        "time_unit": "seconds",
                    },
                ],
            },
        )

        # ASSERT
        assert response.status_code == 200
        body = response.json()
        assert body["plan_id"] == 10
        assert body["session_id"] == 42

    def test_create_treatment_plan_empty_exercises_returns_422(self) -> None:
        """
        Given a request body with an empty exercises array,
        When POST /treatment-plan/42 is called,
        Then 422 Unprocessable Entity is returned (Pydantic min_length=1 validation).
        """
        # PREPARE
        cursor = _TreatmentPlanStubCursor(fetchone_rows=[])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.post(
            "/treatment-plan/42",
            json={
                "goal": "Restore range of motion",
                "start_date": "2026-05-01",
                "end_date": "2026-07-01",
                "exercises": [],
            },
        )

        # ASSERT
        assert response.status_code == 422

    def test_create_treatment_plan_plan_already_exists_returns_409(self) -> None:
        """
        Given a treatment plan already exists for the session (plan_exists returns a row),
        When POST /treatment-plan/42 is called,
        Then 409 Conflict is returned.

        fetchone sequence:
          1. get_treatment_plan_context → PHYSIOTHERAPIST context
          2. plan_exists → {plan_id: 5}  (plan already exists)
        """
        # PREPARE
        cursor = _TreatmentPlanStubCursor(
            fetchone_rows=[
                {
                    "session_id": 42,
                    "medical_diagnosis": "ACL tear",
                    "visit_type": "PHYSIOTHERAPIST",
                },
                {"plan_id": 5},
            ]
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.post(
            "/treatment-plan/42",
            json={
                "goal": "Restore range of motion",
                "start_date": "2026-05-01",
                "end_date": "2026-07-01",
                "exercises": [
                    {
                        "exercise_id": 1,
                        "reps": 10,
                        "num_sets": 3,
                        "weight": 0.0,
                        "time_duration": 30,
                        "time_unit": "seconds",
                    }
                ],
            },
        )

        # ASSERT
        assert response.status_code == 409

    def test_create_treatment_plan_fitness_exercise_returns_400(self) -> None:
        """
        Given one requested exercise is not a PHYSIOTHERAPIST exercise
        (valid_ids does not contain it),
        When POST /treatment-plan/42 is called,
        Then 400 Bad Request is returned.

        fetchone sequence:
          1. get_treatment_plan_context → PHYSIOTHERAPIST context
          2. plan_exists → None  (no plan)
        fetchall: [] (none of the requested exercise IDs are valid PHYSIOTHERAPIST exercises)
        """
        # PREPARE
        cursor = _TreatmentPlanStubCursor(
            fetchone_rows=[
                {
                    "session_id": 42,
                    "medical_diagnosis": "ACL tear",
                    "visit_type": "PHYSIOTHERAPIST",
                },
                None,
            ],
            fetchall_rows=[],
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.post(
            "/treatment-plan/42",
            json={
                "goal": "Restore range of motion",
                "start_date": "2026-05-01",
                "end_date": "2026-07-01",
                "exercises": [
                    {
                        "exercise_id": 99,
                        "reps": 10,
                        "num_sets": 3,
                        "weight": 0.0,
                        "time_duration": 30,
                        "time_unit": "seconds",
                    }
                ],
            },
        )

        # ASSERT
        assert response.status_code == 400

    def test_create_treatment_plan_missing_required_fields_returns_422(self) -> None:
        """
        Given a request body missing required fields (goal and end_date),
        When POST /treatment-plan/42 is called,
        Then 422 Unprocessable Entity is returned.
        """
        # PREPARE
        cursor = _TreatmentPlanStubCursor(fetchone_rows=[])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.post(
            "/treatment-plan/42",
            json={"start_date": "2026-05-01"},
        )

        # ASSERT
        assert response.status_code == 422

    # ── GET /treatment-plan/plan/{plan_id} ───────────────────────────────

    def test_get_treatment_plan_by_plan_id_found_returns_200(self) -> None:
        """
        Given an active plan with one exercise,
        When GET /treatment-plan/plan/{plan_id} is called,
        Then 200 is returned with plan details and the exercise list.
        """
        # PREPARE
        cursor = _TreatmentPlanStubCursor(
            fetchone_rows=[
                {
                    "plan_id": 6,
                    "session_id": 103,
                    "medical_diagnosis": "Shoulder Impingement",
                    "goal": "Restore full range of motion",
                    "start_date": datetime.date(2025, 1, 6),
                    "end_date": datetime.date(2025, 3, 1),
                    "notes": None,
                }
            ],
            fetchall_rows=[
                {
                    "exercise_id": 1,
                    "exercise_name": "Wall Squats",
                    "reps": 12,
                    "num_sets": 3,
                    "weight": None,
                    "time_duration": 3,
                    "time_unit": "Weekly",
                    "description": None,
                }
            ],
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get("/treatment-plan/plan/6")

        # ASSERT
        assert response.status_code == 200
        body = response.json()
        assert body["plan_id"] == 6
        assert body["session_id"] == 103
        assert body["medical_diagnosis"] == "Shoulder Impingement"
        assert body["goal"] == "Restore full range of motion"
        assert body["notes"] is None
        assert len(body["exercises"]) == 1
        assert body["exercises"][0]["exercise_id"] == 1
        assert body["exercises"][0]["exercise_name"] == "Wall Squats"
        assert body["exercises"][0]["num_sets"] == 3

    def test_get_treatment_plan_by_plan_id_not_found_returns_404(self) -> None:
        """
        Given no active plan exists for the plan_id,
        When GET /treatment-plan/plan/{plan_id} is called,
        Then 404 Not Found is returned.
        """
        # PREPARE
        cursor = _TreatmentPlanStubCursor(fetchone_rows=[None])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get("/treatment-plan/plan/9999")

        # ASSERT
        assert response.status_code == 404

    def test_create_treatment_plan_end_date_before_start_date_returns_422(
        self,
    ) -> None:
        """
        Given end_date is before start_date in the request body,
        When POST /treatment-plan/42 is called,
        Then 422 Unprocessable Entity is returned (model_validator).
        """
        # PREPARE
        cursor = _TreatmentPlanStubCursor(fetchone_rows=[])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.post(
            "/treatment-plan/42",
            json={
                "goal": "Restore range of motion",
                "start_date": "2026-07-01",
                "end_date": "2026-05-01",
                "exercises": [
                    {
                        "exercise_id": 1,
                        "reps": 10,
                        "num_sets": 3,
                        "weight": 0.0,
                        "time_duration": 30,
                        "time_unit": "seconds",
                    }
                ],
            },
        )

        # ASSERT
        assert response.status_code == 422
