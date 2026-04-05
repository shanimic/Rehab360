"""Unit tests for user HTTP routes (DB dependency overridden with mock cursor)."""

import unittest

from fastapi.testclient import TestClient
from mockito import ANY, expect, mock

from app.core.security import hash_password
from app.db.session import get_db
from app.main import app
from tests.unit.async_helpers import async_return


class UserRoutesTest(unittest.TestCase):
    def tearDown(self) -> None:
        app.dependency_overrides.clear()

    def test_login_success_returns_user_payload_without_password(self) -> None:
        """
        Given a stored user row with a valid password hash,
        When POST /users/login is called with matching credentials,
        Then 200 is returned and the JSON body excludes the password.
        """
        # PREPARE
        cursor = mock()

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db
        plain = "route-secret"
        hashed = hash_password(plain)

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(async_return(None))
        expect(cursor, times=1).fetchone().thenReturn(
            async_return(
                {
                    "email": "route@test.com",
                    "password": hashed,
                    "role": "PATIENT",
                    "first_name": "Route",
                }
            )
        )

        # ACT
        client = TestClient(app)
        response = client.post(
            "/users/login",
            json={"email": "route@test.com", "password": plain, "role": "PATIENT"},
        )

        # ASSERT
        assert response.status_code == 200
        assert response.json() == {
            "email": "route@test.com",
            "role": "PATIENT",
            "first_name": "Route",
        }

    def test_login_no_user_returns_401(self) -> None:
        """
        Given no matching user row,
        When POST /users/login is called,
        Then 401 Unauthorized is returned.
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
        response = client.post(
            "/users/login",
            json={"email": "nobody@test.com", "password": "x", "role": "PATIENT"},
        )

        # ASSERT
        assert response.status_code == 401

    def test_login_wrong_password_returns_401(self) -> None:
        """
        Given a user row whose hash does not match the posted password,
        When POST /users/login is called,
        Then 401 Unauthorized is returned.
        """
        # PREPARE
        cursor = mock()

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db
        hashed = hash_password("actual-secret")

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(async_return(None))
        expect(cursor, times=1).fetchone().thenReturn(
            async_return(
                {
                    "email": "badpw@test.com",
                    "password": hashed,
                    "role": "PHYSIOTHERAPIST",
                    "first_name": "T",
                }
            )
        )

        # ACT
        client = TestClient(app)
        response = client.post(
            "/users/login",
            json={
                "email": "badpw@test.com",
                "password": "wrong-password",
                "role": "PHYSIOTHERAPIST",
            },
        )

        # ASSERT
        assert response.status_code == 401

    def test_register_new_user_returns_profile(self) -> None:
        """
        Given no existing user for the email/role,
        When POST /users/register is called,
        Then 200 is returned with first_name, last_name, email, and role.
        """
        # PREPARE
        cursor = mock()

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(async_return(None))
        expect(cursor, times=1).fetchone().thenReturn(async_return(None))
        expect(cursor, times=1).execute(ANY, ANY).thenReturn(async_return(None))

        # ACT
        client = TestClient(app)
        response = client.post(
            "/users/register",
            json={
                "user_id": "123456789",
                "first_name": "New",
                "last_name": "Pat",
                "email": "newpat@test.com",
                "password": "plain-reg",
                "phone": "050-0000000",
                "birth_date": "1990-01-01",
                "role": "PATIENT",
            },
        )

        # ASSERT
        assert response.status_code == 200
        body = response.json()
        assert body["first_name"] == "New"
        assert body["last_name"] == "Pat"
        assert body["email"] == "newpat@test.com"
        assert body["role"] == "PATIENT"

    def test_register_duplicate_returns_409(self) -> None:
        """
        Given a user already exists for the email/role,
        When POST /users/register is called,
        Then 409 Conflict is returned.
        """
        # PREPARE
        cursor = mock()

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db
        hashed = hash_password("existing")

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(async_return(None))
        expect(cursor, times=1).fetchone().thenReturn(
            async_return(
                {
                    "email": "dup@test.com",
                    "password": hashed,
                    "role": "PATIENT",
                    "first_name": "Dup",
                }
            )
        )

        # ACT
        client = TestClient(app)
        response = client.post(
            "/users/register",
            json={
                "user_id": "999999999",
                "first_name": "Dup",
                "last_name": "User",
                "email": "dup@test.com",
                "password": "anything",
                "phone": "050-0000000",
                "birth_date": "1990-01-01",
                "role": "PATIENT",
            },
        )

        # ASSERT
        assert response.status_code == 409

    def test_login_invalid_body_returns_422(self) -> None:
        """
        Given a request body missing required fields,
        When POST /users/login is called,
        Then 422 validation error is returned.
        """
        # PREPARE
        cursor = mock()

        async def override_get_db():
            yield cursor

        app.dependency_overrides[get_db] = override_get_db

        # ACT
        client = TestClient(app)
        response = client.post("/users/login", json={"email": "only-email@test.com"})

        # ASSERT
        assert response.status_code == 422
