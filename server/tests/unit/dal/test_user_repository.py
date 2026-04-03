"""Unit tests for UserRepository (mocked cursor)."""

import asyncio
import unittest

from mockito import ANY, expect, mock

from app.dal.user_repository import UserRepository
from app.models.enums.role import Role
from app.models.users.user import LoginRequest, RegisterRequest

from tests.unit.async_helpers import async_return


class UserRepositoryTest(unittest.TestCase):
    def test_get_user_for_auth_returns_login_response_when_row_exists(self) -> None:
        """
        Given the DB returns a matching row,
        When get_user_for_auth is called,
        Then a LoginResponse is built from that row.
        """
        # PREPARE
        cursor = mock()
        repo = UserRepository(db=cursor)
        login = LoginRequest(email="u@test.com", password="x", role=Role.PATIENT)
        row = {
            "email": "u@test.com",
            "password": "hashed",
            "role": "PATIENT",
            "first_name": "U",
        }

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(async_return(None))
        expect(cursor, times=1).fetchone().thenReturn(async_return(row))

        # ACT
        result = asyncio.run(repo.get_user_for_auth(login))

        # ASSERT
        assert result is not None
        assert result.email == "u@test.com"
        assert result.role == Role.PATIENT
        assert result.first_name == "U"

    def test_get_user_for_auth_returns_none_when_no_row(self) -> None:
        """
        Given the DB returns no row,
        When get_user_for_auth is called,
        Then None is returned.
        """
        # PREPARE
        cursor = mock()
        repo = UserRepository(db=cursor)
        login = LoginRequest(email="missing@test.com", password="x", role=Role.THERAPIST)

        # MOCK
        expect(cursor, times=1).execute(query=ANY, args=ANY).thenReturn(async_return(None))
        expect(cursor, times=1).fetchone().thenReturn(async_return(None))

        # ACT
        result = asyncio.run(repo.get_user_for_auth(login))

        # ASSERT
        assert result is None

    def test_create_user_executes_insert_and_returns_register_response(self) -> None:
        """
        Given a valid RegisterRequest,
        When create_user is called,
        Then INSERT runs and a RegisterResponse with the same identity fields is returned.
        """
        # PREPARE
        cursor = mock()
        repo = UserRepository(db=cursor)
        register = RegisterRequest(
            name="N",
            email="n@test.com",
            password="hashed-stored",
            role=Role.PATIENT,
        )

        # MOCK
        expect(cursor, times=1).execute(ANY, ANY).thenReturn(async_return(None))

        # ACT
        result = asyncio.run(repo.create_user(register))

        # ASSERT
        assert result.name == "N"
        assert result.email == "n@test.com"
        assert result.role == Role.PATIENT
