"""Unit tests for visit summary HTTP routes (DB dependency overridden with stub cursor)."""

import datetime
import unittest
from collections import deque

from fastapi.testclient import TestClient

from app.db.session import get_db
from app.main import app


class _VisitSummaryStubCursor:
    """Minimal async cursor stub for visit summary tests."""

    def __init__(self, fetchone_rows: list, fetchall_rows: list | None = None) -> None:
        self._fetchone_queue: deque = deque(fetchone_rows)
        self._fetchall_rows: list = fetchall_rows if fetchall_rows is not None else []

    async def execute(self, *_args, **_kwargs) -> None:
        return None

    async def fetchone(self):
        return self._fetchone_queue.popleft() if self._fetchone_queue else None

    async def fetchall(self) -> list:
        return self._fetchall_rows


class VisitSummaryRoutesTest(unittest.TestCase):
    def tearDown(self) -> None:
        app.dependency_overrides.clear()

    # ── GET /visit-summary/patient/{patient_id} ──────────────────────────────

    def test_get_patient_details_found_returns_200(self) -> None:
        """
        Given a patient row exists in the DB,
        When GET /visit-summary/patient/{patient_id} is called,
        Then 200 is returned with the six patient fields and no plan_id.
        """
        # PREPARE
        patient_id = "P100"
        cursor = _VisitSummaryStubCursor(
            fetchone_rows=[
                {
                    "patient_id": "P100",
                    "patient_first_name": "Alice",
                    "patient_last_name": "Smith",
                    "phone": "050-1234567",
                    "birth_date": datetime.date(1990, 5, 15),
                    "email": "alice@example.com",
                }
            ]
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get(f"/visit-summary/patient/{patient_id}")

        # ASSERT
        assert response.status_code == 200
        body = response.json()
        assert body["patient_id"] == "P100"
        assert body["patient_first_name"] == "Alice"
        assert body["patient_last_name"] == "Smith"
        assert body["phone"] == "050-1234567"
        assert body["email"] == "alice@example.com"
        assert "plan_id" not in body

    def test_get_patient_details_not_found_returns_404(self) -> None:
        """
        Given no matching patient row in the DB,
        When GET /visit-summary/patient/{patient_id} is called,
        Then 404 Not Found is returned.
        """
        # PREPARE
        cursor = _VisitSummaryStubCursor(fetchone_rows=[None])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get("/visit-summary/patient/UNKNOWN")

        # ASSERT
        assert response.status_code == 404

    # ── GET /visit-summary/sessions/{patient_id} ─────────────────────────────

    def test_get_sessions_by_patient_returns_list(self) -> None:
        """
        Given two active session rows for a patient,
        When GET /visit-summary/sessions/{patient_id} is called,
        Then 200 is returned with both sessions in the response list.
        """
        # PREPARE
        cursor = _VisitSummaryStubCursor(
            fetchone_rows=[],
            fetchall_rows=[
                {
                    "session_id": 10,
                    "visit_date": datetime.date(2026, 4, 20),
                    "visit_time": datetime.time(10, 0, 0),
                    "visit_type": "PHYSIOTHERAPIST",
                    "treatment_area": "Knee",
                    "medical_diagnosis": "ACL tear",
                    "description": "Initial assessment",
                    "therapist_first_name": "Bob",
                    "therapist_last_name": "Cohen",
                },
                {
                    "session_id": 11,
                    "visit_date": datetime.date(2026, 4, 10),
                    "visit_time": datetime.time(14, 30, 0),
                    "visit_type": "FITNESS",
                    "treatment_area": "Shoulder",
                    "medical_diagnosis": "Rotator cuff",
                    "description": "Strength work",
                    "therapist_first_name": "Dana",
                    "therapist_last_name": "Levi",
                },
            ],
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get("/visit-summary/sessions/P100")

        # ASSERT
        assert response.status_code == 200
        body = response.json()
        assert len(body) == 2
        assert body[0]["session_id"] == 10
        assert body[0]["visit_type"] == "PHYSIOTHERAPIST"
        assert body[0]["therapist_first_name"] == "Bob"
        assert body[1]["session_id"] == 11
        assert body[1]["visit_type"] == "FITNESS"

    def test_get_sessions_by_patient_empty_returns_empty_list(self) -> None:
        """
        Given no active sessions for a patient,
        When GET /visit-summary/sessions/{patient_id} is called,
        Then 200 is returned with an empty list.
        """
        # PREPARE
        cursor = _VisitSummaryStubCursor(fetchone_rows=[], fetchall_rows=[])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get("/visit-summary/sessions/P999")

        # ASSERT
        assert response.status_code == 200
        assert response.json() == []

    # ── GET /visit-summary/has-previous-plan/{patient_id} ────────────────────

    def test_has_previous_plan_true_when_active_session_with_plan_exists(self) -> None:
        """
        Given an active session with a linked plan exists for the patient,
        When GET /visit-summary/has-previous-plan/{patient_id}?visit_type=PHYSIOTHERAPIST is called,
        Then 200 is returned with has_previous_plan=true.
        """
        # PREPARE
        cursor = _VisitSummaryStubCursor(
            fetchone_rows=[{"session_id": 10, "plan_id": 5}]
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get(
            "/visit-summary/has-previous-plan/P100?visit_type=PHYSIOTHERAPIST"
        )

        # ASSERT
        assert response.status_code == 200
        assert response.json() == {"has_previous_plan": True}

    def test_has_previous_plan_false_when_no_active_session(self) -> None:
        """
        Given no active session exists for the patient and visit type,
        When GET /visit-summary/has-previous-plan/{patient_id}?visit_type=FITNESS is called,
        Then 200 is returned with has_previous_plan=false.
        """
        # PREPARE
        cursor = _VisitSummaryStubCursor(fetchone_rows=[None])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get(
            "/visit-summary/has-previous-plan/P100?visit_type=FITNESS"
        )

        # ASSERT
        assert response.status_code == 200
        assert response.json() == {"has_previous_plan": False}

    def test_has_previous_plan_false_when_no_session_has_plan(self) -> None:
        """
        Given no session for the patient and visit type has any linked plan,
        When GET /visit-summary/has-previous-plan/{patient_id} is called,
        Then 200 is returned with has_previous_plan=false.
        """
        # PREPARE
        cursor = _VisitSummaryStubCursor(fetchone_rows=[None])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get(
            "/visit-summary/has-previous-plan/P100?visit_type=PHYSIOTHERAPIST"
        )

        # ASSERT
        assert response.status_code == 200
        assert response.json() == {"has_previous_plan": False}

    # ── POST /visit-summary ───────────────────────────────────────────────────

    def test_create_visit_summary_physiotherapist_returns_session_id(self) -> None:
        """
        Given a PHYSIOTHERAPIST therapist_role with no copy flag,
        When POST /visit-summary is called with valid fields,
        Then 200 is returned with the new session_id.
        """
        # PREPARE
        # fetchone queue: [LAST_INSERT_ID result]
        cursor = _VisitSummaryStubCursor(fetchone_rows=[{"session_id": 201}])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.post(
            "/visit-summary",
            json={
                "treatment_area": "Knee",
                "medical_diagnosis": "ACL tear",
                "description": "Initial assessment",
                "patient_id": "P100",
                "therapist_id": "T001",
                "therapist_role": "PHYSIOTHERAPIST",
            },
        )

        # ASSERT
        assert response.status_code == 200
        assert response.json() == {"session_id": 201}

    def test_create_visit_summary_fitness_trainer_returns_session_id(self) -> None:
        """
        Given a FITNESS_TRAINER therapist_role with no copy flag,
        When POST /visit-summary is called with valid fields,
        Then 200 is returned with the new session_id.
        """
        # PREPARE
        cursor = _VisitSummaryStubCursor(fetchone_rows=[{"session_id": 202}])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.post(
            "/visit-summary",
            json={
                "treatment_area": "Shoulder",
                "medical_diagnosis": "Rotator cuff",
                "description": "Strength training plan",
                "patient_id": "P101",
                "therapist_id": "T002",
                "therapist_role": "FITNESS_TRAINER",
            },
        )

        # ASSERT
        assert response.status_code == 200
        assert response.json() == {"session_id": 202}

    def test_create_visit_summary_with_optional_recommendations(self) -> None:
        """
        Given a request that includes the optional recommendations field,
        When POST /visit-summary is called,
        Then 200 is returned with the new session_id.
        """
        # PREPARE
        cursor = _VisitSummaryStubCursor(fetchone_rows=[{"session_id": 203}])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.post(
            "/visit-summary",
            json={
                "treatment_area": "Back",
                "medical_diagnosis": "Herniated disc",
                "description": "Post-op recovery",
                "recommendations": "Rest and ice daily",
                "patient_id": "P102",
                "therapist_id": "T001",
                "therapist_role": "PHYSIOTHERAPIST",
            },
        )

        # ASSERT
        assert response.status_code == 200
        assert response.json() == {"session_id": 203}

    def test_create_visit_summary_invalid_therapist_role_returns_400(self) -> None:
        """
        Given a PATIENT therapist_role in the request body,
        When POST /visit-summary is called,
        Then 400 Bad Request is returned.
        """
        # PREPARE
        cursor = _VisitSummaryStubCursor(fetchone_rows=[])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.post(
            "/visit-summary",
            json={
                "treatment_area": "Back",
                "medical_diagnosis": "Herniated disc",
                "description": "Recovery",
                "patient_id": "P102",
                "therapist_id": "P102",
                "therapist_role": "PATIENT",
            },
        )

        # ASSERT
        assert response.status_code == 400

    def test_create_visit_summary_missing_required_fields_returns_422(self) -> None:
        """
        Given a request body missing required fields,
        When POST /visit-summary is called,
        Then 422 Unprocessable Entity is returned.
        """
        # PREPARE
        cursor = _VisitSummaryStubCursor(fetchone_rows=[])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.post("/visit-summary", json={"treatment_area": "Knee"})

        # ASSERT
        assert response.status_code == 422

    def test_create_visit_summary_copy_previous_plan_true_copies_plan(self) -> None:
        """
        Given copy_previous_plan is True and a previous active plan exists,
        When POST /visit-summary is called,
        Then 200 is returned with the new session_id and the plan copy executes.
        """
        # PREPARE
        # fetchone queue: [get_active_session_with_plan, LAST_INSERT_ID(session), LAST_INSERT_ID(plan)]
        cursor = _VisitSummaryStubCursor(
            fetchone_rows=[
                {"session_id": 10, "plan_id": 3},
                {"session_id": 210},
                {"plan_id": 20},
            ]
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.post(
            "/visit-summary",
            json={
                "treatment_area": "Knee",
                "medical_diagnosis": "ACL tear",
                "description": "Follow-up",
                "patient_id": "P100",
                "therapist_id": "T001",
                "therapist_role": "PHYSIOTHERAPIST",
                "copy_previous_plan": True,
            },
        )

        # ASSERT
        assert response.status_code == 200
        assert response.json() == {"session_id": 210}

    def test_create_visit_summary_copy_previous_plan_true_no_previous_plan_returns_409(
        self,
    ) -> None:
        """
        Given copy_previous_plan is True but no previous plan exists,
        When POST /visit-summary is called,
        Then 409 Conflict is returned.
        """
        # PREPARE
        cursor = _VisitSummaryStubCursor(fetchone_rows=[None])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.post(
            "/visit-summary",
            json={
                "treatment_area": "Knee",
                "medical_diagnosis": "ACL tear",
                "description": "Follow-up",
                "patient_id": "P100",
                "therapist_id": "T001",
                "therapist_role": "PHYSIOTHERAPIST",
                "copy_previous_plan": True,
            },
        )

        # ASSERT
        assert response.status_code == 409

    # ── GET /visit-summary/{session_id} ──────────────────────────────────────

    def test_get_visit_summary_by_session_id_found_returns_200(self) -> None:
        """
        Given a full session row exists in the DB,
        When GET /visit-summary/{session_id} is called with a valid integer,
        Then 200 is returned with the complete visit summary payload.
        """
        # PREPARE
        cursor = _VisitSummaryStubCursor(
            fetchone_rows=[
                {
                    "patient_id": "P100",
                    "patient_first_name": "Alice",
                    "patient_last_name": "Smith",
                    "phone": "050-1234567",
                    "birth_date": datetime.date(1990, 5, 15),
                    "email": "alice@example.com",
                    "session_id": 42,
                    "visit_date": datetime.date(2026, 1, 10),
                    "visit_time": datetime.time(10, 0, 0),
                    "visit_type": "PHYSIOTHERAPIST",
                    "treatment_area": "Knee",
                    "medical_diagnosis": "ACL tear",
                    "description": "Initial assessment",
                    "recommendations": "Rest and ice",
                    "therapist_first_name": "Liran",
                    "therapist_last_name": "Cohen",
                    "therapist_role": "PHYSIOTHERAPIST",
                    "plan_id": 5,
                }
            ]
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get("/visit-summary/42")

        # ASSERT
        assert response.status_code == 200
        body = response.json()
        assert body["patient_id"] == "P100"
        assert body["patient_first_name"] == "Alice"
        assert body["session_id"] == 42
        assert body["visit_type"] == "PHYSIOTHERAPIST"
        assert body["treatment_area"] == "Knee"
        assert body["therapist_first_name"] == "Liran"
        assert body["therapist_last_name"] == "Cohen"
        assert body["plan_id"] == 5

    def test_get_visit_summary_by_session_id_not_found_returns_404(self) -> None:
        """
        Given no session row matches the given session_id,
        When GET /visit-summary/{session_id} is called,
        Then 404 Not Found is returned.
        """
        # PREPARE
        cursor = _VisitSummaryStubCursor(fetchone_rows=[None])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get("/visit-summary/9999")

        # ASSERT
        assert response.status_code == 404

    def test_get_visit_summary_by_session_id_with_plan_returns_plan_id(self) -> None:
        """
        Given a session row where a plan is linked,
        When GET /visit-summary/{session_id} is called,
        Then 200 is returned and plan_id is present in the response.
        """
        # PREPARE
        cursor = _VisitSummaryStubCursor(
            fetchone_rows=[
                {
                    "patient_id": "P200",
                    "patient_first_name": "Dana",
                    "patient_last_name": "Levi",
                    "phone": None,
                    "birth_date": datetime.date(1985, 8, 20),
                    "email": None,
                    "session_id": 7,
                    "visit_date": datetime.date(2026, 3, 1),
                    "visit_time": datetime.time(9, 30, 0),
                    "visit_type": "FITNESS",
                    "treatment_area": "Shoulder",
                    "medical_diagnosis": "Rotator cuff strain",
                    "description": "Strength work",
                    "recommendations": None,
                    "therapist_first_name": "Yael",
                    "therapist_last_name": "Bar",
                    "therapist_role": "FITNESS_TRAINER",
                    "plan_id": 12,
                }
            ]
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get("/visit-summary/7")

        # ASSERT
        assert response.status_code == 200
        assert response.json()["plan_id"] == 12

    def test_get_visit_summary_by_session_id_without_plan_returns_null_plan_id(
        self,
    ) -> None:
        """
        Given a session row where no plan is linked (LEFT JOIN returns NULL),
        When GET /visit-summary/{session_id} is called,
        Then 200 is returned and plan_id is null.
        """
        # PREPARE
        cursor = _VisitSummaryStubCursor(
            fetchone_rows=[
                {
                    "patient_id": "P300",
                    "patient_first_name": "Oren",
                    "patient_last_name": "Katz",
                    "phone": "052-0000000",
                    "birth_date": datetime.date(1992, 1, 1),
                    "email": "oren@example.com",
                    "session_id": 15,
                    "visit_date": datetime.date(2026, 2, 14),
                    "visit_time": datetime.time(11, 0, 0),
                    "visit_type": "PHYSIOTHERAPIST",
                    "treatment_area": "Back",
                    "medical_diagnosis": "Herniated disc",
                    "description": "Follow-up session",
                    "recommendations": "Continue exercises",
                    "therapist_first_name": "Noa",
                    "therapist_last_name": "Shamir",
                    "therapist_role": "PHYSIOTHERAPIST",
                    "plan_id": None,
                }
            ]
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get("/visit-summary/15")

        # ASSERT
        assert response.status_code == 200
        assert response.json()["plan_id"] is None

    def test_get_visit_summary_by_session_id_visit_time_as_timedelta_converts(
        self,
    ) -> None:
        """
        Given the DB returns visit_time as a timedelta (aiomysql behavior),
        When GET /visit-summary/{session_id} is called,
        Then 200 is returned and visit_time is serialized as HH:MM:SS string.
        """
        # PREPARE
        cursor = _VisitSummaryStubCursor(
            fetchone_rows=[
                {
                    "patient_id": "P400",
                    "patient_first_name": "Maya",
                    "patient_last_name": "Gross",
                    "phone": None,
                    "birth_date": None,
                    "email": None,
                    "session_id": 20,
                    "visit_date": datetime.date(2026, 4, 1),
                    "visit_time": datetime.timedelta(seconds=36000),
                    "visit_type": "PHYSIOTHERAPIST",
                    "treatment_area": "Hip",
                    "medical_diagnosis": "Labral tear",
                    "description": "Post-surgery rehab",
                    "recommendations": None,
                    "therapist_first_name": "Ron",
                    "therapist_last_name": "Avi",
                    "therapist_role": "PHYSIOTHERAPIST",
                    "plan_id": None,
                }
            ]
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get("/visit-summary/20")

        # ASSERT
        assert response.status_code == 200
        assert response.json()["visit_time"] == "10:00:00"

    # ── POST /visit-summary/plan ──────────────────────────────────────────────

    def test_create_plan_returns_plan_id_and_session_id(self) -> None:
        """
        Given a valid plan request with an existing session_id,
        When POST /visit-summary/plan is called,
        Then 200 is returned with the new plan_id and the linked session_id.
        """
        # PREPARE
        cursor = _VisitSummaryStubCursor(
            fetchone_rows=[{"plan_id": 5, "session_id": 10}]
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.post(
            "/visit-summary/plan",
            json={
                "session_id": 10,
                "goal": "Restore full range of motion in shoulder",
                "start_date": "2026-05-01",
                "end_date": "2026-07-01",
            },
        )

        # ASSERT
        assert response.status_code == 200
        body = response.json()
        assert body["plan_id"] == 5
        assert body["session_id"] == 10

    def test_create_plan_missing_required_fields_returns_422(self) -> None:
        """
        Given a plan request missing the required goal field,
        When POST /visit-summary/plan is called,
        Then 422 Unprocessable Entity is returned.
        """
        # PREPARE
        cursor = _VisitSummaryStubCursor(fetchone_rows=[])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.post(
            "/visit-summary/plan",
            json={"session_id": 10},
        )

        # ASSERT
        assert response.status_code == 422

    # ── POST /visit-summary/ensure-plan/{session_id} ──────────────────────────

    def test_ensure_plan_plan_already_exists_returns_204(self) -> None:
        """
        Given a plan already exists for the session,
        When POST /visit-summary/ensure-plan/{session_id} is called,
        Then 204 No Content is returned and no copy is performed.
        """
        # PREPARE
        cursor = _VisitSummaryStubCursor(fetchone_rows=[{"plan_id": 5}])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.post("/visit-summary/ensure-plan/42")

        # ASSERT
        assert response.status_code == 204

    def test_ensure_plan_no_previous_plan_returns_409(self) -> None:
        """
        Given no plan exists for the session and no previous plan is available,
        When POST /visit-summary/ensure-plan/{session_id} is called,
        Then 409 Conflict is returned so the user must create a plan manually.
        """
        # PREPARE
        cursor = _VisitSummaryStubCursor(
            fetchone_rows=[
                None,  # plan_exists_for_session → no plan
                {"patient_id": "P100", "visit_type": "PHYSIOTHERAPIST"},
                None,  # get_latest_session_with_plan → no previous plan
            ]
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.post("/visit-summary/ensure-plan/42")

        # ASSERT
        assert response.status_code == 409

    def test_ensure_plan_copies_previous_plan_returns_204(self) -> None:
        """
        Given no plan exists for the session but a previous plan is available,
        When POST /visit-summary/ensure-plan/{session_id} is called,
        Then the plan is copied and 204 No Content is returned.
        """
        # PREPARE
        # fetchone order: plan_exists(→None), session_info, previous_plan, LAST_INSERT_ID
        cursor = _VisitSummaryStubCursor(
            fetchone_rows=[
                None,  # plan_exists_for_session → no plan
                {"patient_id": "P100", "visit_type": "PHYSIOTHERAPIST"},
                {"session_id": 101, "plan_id": 3},  # get_latest_session_with_plan
                {"plan_id": 99},  # LAST_INSERT_ID after copy_plan_to_session
            ]
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.post("/visit-summary/ensure-plan/42")

        # ASSERT
        assert response.status_code == 204
