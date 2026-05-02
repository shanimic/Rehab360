"""Unit tests for profile HTTP routes (DB dependency overridden with mock cursor)."""
# pylint: disable=duplicate-code

import datetime
import unittest

from fastapi.testclient import TestClient
from mockito import ANY, expect, mock

from app.db.session import get_db
from app.main import app
from tests.unit.async_helpers import async_return


class ProfileRoutesTest(unittest.TestCase):
    def tearDown(self) -> None:
        app.dependency_overrides.clear()

    # ------------------------------------------------------------------ #
    # GET /profile/{user_id}                                              #
    # ------------------------------------------------------------------ #

    def test_get_profile_user_exists_returns_200_with_profile(self) -> None:
        """
        Given the DB returns a user row for the given user_id,
        When GET /profile/{user_id} is called,
        Then 200 is returned with the profile fields.
        """
        # PREPARE
        cursor = mock()

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db
        row = {
            "last_name": "Smith",
            "email": "smith@test.com",
            "phone": "050-0000001",
            "birth_date": datetime.date(1990, 1, 1),
            "license_number": None,
        }

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(async_return(None))
        expect(cursor, times=1).fetchone().thenReturn(async_return(row))

        # ACT
        client = TestClient(app)
        response = client.get("/profile/user-001")

        # ASSERT
        assert response.status_code == 200
        body = response.json()
        assert body["last_name"] == "Smith"
        assert body["email"] == "smith@test.com"
        assert body["license_number"] is None

    def test_get_profile_user_not_found_returns_404(self) -> None:
        """
        Given the DB returns no row for the given user_id,
        When GET /profile/{user_id} is called,
        Then 404 Not Found is returned.
        """
        # PREPARE
        cursor = mock()

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(async_return(None))
        expect(cursor, times=1).fetchone().thenReturn(async_return(None))

        # ACT
        client = TestClient(app)
        response = client.get("/profile/ghost-001")

        # ASSERT
        assert response.status_code == 404

    # ------------------------------------------------------------------ #
    # GET /profile/{user_id}/plans                                        #
    # ------------------------------------------------------------------ #

    def test_get_patient_plans_returns_200_with_plans(self) -> None:
        """
        Given the DB returns plan rows for the patient,
        When GET /profile/{user_id}/plans is called,
        Then 200 is returned with the list of plans.
        """
        # PREPARE
        cursor = mock()

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db
        rows = [
            {
                "plan_id": 1,
                "goal": "Recover knee",
                "category": "PHYSIOTHERAPY",
                "start_date": datetime.date(2026, 1, 1),
                "end_date": datetime.date(2026, 3, 1),
                "completion_percent": 50.0,
            }
        ]

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(async_return(None))
        expect(cursor, times=1).fetchall().thenReturn(async_return(rows))

        # ACT
        client = TestClient(app)
        response = client.get("/profile/patient-001/plans")

        # ASSERT
        assert response.status_code == 200
        body = response.json()
        assert len(body) == 1
        assert body[0]["plan_id"] == 1
        assert body[0]["goal"] == "Recover knee"

    def test_get_patient_plans_no_plans_returns_200_with_empty_list(self) -> None:
        """
        Given the patient has no active plans in the DB,
        When GET /profile/{user_id}/plans is called,
        Then 200 is returned with an empty list.
        """
        # PREPARE
        cursor = mock()

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(async_return(None))
        expect(cursor, times=1).fetchall().thenReturn(async_return([]))

        # ACT
        client = TestClient(app)
        response = client.get("/profile/patient-002/plans")

        # ASSERT
        assert response.status_code == 200
        assert response.json() == []
