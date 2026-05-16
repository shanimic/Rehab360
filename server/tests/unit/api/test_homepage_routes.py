"""Unit tests for homepage HTTP routes (DB dependency overridden with stub cursor)."""

import datetime
import unittest
from collections import deque

from fastapi.testclient import TestClient

from app.db.session import get_db
from app.main import app


class _HomepageStubCursor:
    """Minimal async cursor stub for homepage tests.

    fetchall always returns the same list (used for get_home_patients /
    get_all_patients). fetchone pops from a queue, one entry per patient
    progress call.
    """

    def __init__(
        self, fetchall_rows: list | None = None, fetchone_rows: list | None = None
    ) -> None:
        self._fetchall_rows: list = fetchall_rows if fetchall_rows is not None else []
        self._fetchone_queue: deque = deque(fetchone_rows if fetchone_rows is not None else [])

    async def execute(self, *_args, **_kwargs) -> None:
        return None

    async def fetchone(self):
        return self._fetchone_queue.popleft() if self._fetchone_queue else None

    async def fetchall(self) -> list:
        return self._fetchall_rows


class HomepageRoutesTest(unittest.TestCase):
    def tearDown(self) -> None:
        app.dependency_overrides.clear()

    # ── GET /home/patients ───────────────────────────────────────────────────

    def test_get_home_patients_returns_200_with_last_progress_update(self) -> None:
        """
        Given one patient row and a progress row with a non-null last_progress_update,
        When GET /home/patients?therapist_id=T200&therapist_role=PHYSIOTHERAPIST is called,
        Then 200 is returned and the card includes last_progress_update.
        """
        # PREPARE
        cursor = _HomepageStubCursor(
            fetchall_rows=[{
                "patient_id": "P100",
                "first_name": "Alice",
                "last_name": "Smith",
                "medical_diagnosis": "Shoulder impingement",
            }],
            fetchone_rows=[{
                "progress_percentage": 75.0,
                "last_progress_update": datetime.date(2026, 5, 1),
            }],
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get(
            "/home/patients?therapist_id=T200&therapist_role=PHYSIOTHERAPIST"
        )

        # ASSERT
        assert response.status_code == 200
        body = response.json()
        assert len(body) == 1
        card = body[0]
        assert card["patient_id"] == "P100"
        assert card["first_name"] == "Alice"
        assert card["medical_diagnosis"] == "Shoulder impingement"
        assert card["progress_percentage"] == 75.0
        assert card["last_progress_update"] == "2026-05-01"

    def test_get_home_patients_null_last_progress_update_returns_null(self) -> None:
        """
        Given one patient row and a progress row where last_progress_update is None,
        When GET /home/patients is called,
        Then 200 is returned and last_progress_update is null in the response.
        """
        # PREPARE
        cursor = _HomepageStubCursor(
            fetchall_rows=[{
                "patient_id": "P100",
                "first_name": "Alice",
                "last_name": "Smith",
                "medical_diagnosis": "Back pain",
            }],
            fetchone_rows=[{
                "progress_percentage": None,
                "last_progress_update": None,
            }],
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get(
            "/home/patients?therapist_id=T200&therapist_role=PHYSIOTHERAPIST"
        )

        # ASSERT
        assert response.status_code == 200
        body = response.json()
        assert len(body) == 1
        assert body[0]["progress_percentage"] == 0.0
        assert body[0]["last_progress_update"] is None

    def test_get_home_patients_no_patients_returns_empty_list(self) -> None:
        """
        Given no patient rows exist for this therapist,
        When GET /home/patients is called,
        Then 200 is returned with an empty list.
        """
        # PREPARE
        cursor = _HomepageStubCursor(fetchall_rows=[], fetchone_rows=[])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get(
            "/home/patients?therapist_id=T200&therapist_role=PHYSIOTHERAPIST"
        )

        # ASSERT
        assert response.status_code == 200
        assert response.json() == []

    def test_get_home_patients_patient_role_returns_400(self) -> None:
        """
        Given the therapist_role query param is PATIENT,
        When GET /home/patients is called,
        Then 400 Bad Request is returned.
        """
        # PREPARE
        cursor = _HomepageStubCursor()

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get(
            "/home/patients?therapist_id=P999&therapist_role=PATIENT"
        )

        # ASSERT
        assert response.status_code == 400

    def test_get_home_patients_fitness_trainer_returns_200(self) -> None:
        """
        Given a FITNESS_TRAINER role and one patient with a progress entry,
        When GET /home/patients is called,
        Then 200 is returned with the patient card.
        """
        # PREPARE
        cursor = _HomepageStubCursor(
            fetchall_rows=[{
                "patient_id": "P200",
                "first_name": "Bob",
                "last_name": "Jones",
                "medical_diagnosis": "Hip rehab",
            }],
            fetchone_rows=[{
                "progress_percentage": 40.0,
                "last_progress_update": datetime.date(2026, 4, 15),
            }],
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get(
            "/home/patients?therapist_id=F300&therapist_role=FITNESS_TRAINER"
        )

        # ASSERT
        assert response.status_code == 200
        body = response.json()
        assert len(body) == 1
        assert body[0]["patient_id"] == "P200"
        assert body[0]["last_progress_update"] == "2026-04-15"

    # ── GET /home/all-patients ───────────────────────────────────────────────

    def test_get_all_patients_returns_200_with_patient_list(self) -> None:
        """
        Given two patient rows in the system,
        When GET /home/all-patients is called,
        Then 200 is returned with both patients and no progress fields.
        """
        # PREPARE
        cursor = _HomepageStubCursor(
            fetchall_rows=[
                {"patient_id": "P100", "first_name": "Alice", "last_name": "Smith"},
                {"patient_id": "P200", "first_name": "Bob", "last_name": "Jones"},
            ]
        )

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get("/home/all-patients")

        # ASSERT
        assert response.status_code == 200
        body = response.json()
        assert len(body) == 2
        assert body[0]["patient_id"] == "P100"
        assert body[0]["first_name"] == "Alice"
        assert body[1]["patient_id"] == "P200"
        assert "progress_percentage" not in body[0]

    def test_get_all_patients_empty_returns_empty_list(self) -> None:
        """
        Given no patients exist in the system,
        When GET /home/all-patients is called,
        Then 200 is returned with an empty list.
        """
        # PREPARE
        cursor = _HomepageStubCursor(fetchall_rows=[])

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.get("/home/all-patients")

        # ASSERT
        assert response.status_code == 200
        assert response.json() == []
