import asyncio
import unittest

import app.services.user_services as user_services_module
from fastapi import HTTPException
from mockito import expect, mock

from app.dal.user_repository import UserRepository
from app.models.enums.role import Role
from app.models.users.user import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse
from app.services.user_services import UserServices


class UserServicesTest(unittest.TestCase):

    # ------------------------------------------------------------------ #
    # authenticate_user                                                    #
    # ------------------------------------------------------------------ #

    def test_authenticate_user_valid_credentials_returns_login_response(self) -> None:
        """
        Given a user exists in the DB and the supplied password matches the stored hash,
        When authenticate_user is called with valid credentials,
        Then the LoginResponse for that user is returned.
        """
        # PREPARE
        repo = mock(UserRepository)
        service = UserServices(repository=repo)
        request = LoginRequest(email="test@test.com", password="plain123", role=Role.PATIENT)
        stored_user = LoginResponse(email="test@test.com", password="hashed123", role=Role.PATIENT)

        # MOCK
        expect(repo, times=1).get_user_for_auth(request).thenReturn(stored_user)
        expect(user_services_module, times=1).verify_password("plain123", "hashed123").thenReturn(True)

        # ACT
        result = asyncio.run(service.authenticate_user(request))

        # ASSERT
        assert result.email == stored_user.email
        assert result.role == stored_user.role

    def test_authenticate_user_user_not_found_raises_401(self) -> None:
        """
        Given no user in the DB matches the provided email and role,
        When authenticate_user is called,
        Then an HTTP 401 Unauthorized exception is raised.
        """
        # PREPARE
        repo = mock(UserRepository)
        service = UserServices(repository=repo)
        request = LoginRequest(email="ghost@test.com", password="pass", role=Role.PATIENT)

        # MOCK
        expect(repo, times=1).get_user_for_auth(request).thenReturn(None)

        # ACT / ASSERT
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(service.authenticate_user(request))
        self.assertEqual(ctx.exception.status_code, 401)

    def test_authenticate_user_wrong_password_raises_401(self) -> None:
        """
        Given a user exists in the DB but the provided password does not match,
        When authenticate_user is called,
        Then an HTTP 401 Unauthorized exception is raised.
        """
        # PREPARE
        repo = mock(UserRepository)
        service = UserServices(repository=repo)
        request = LoginRequest(email="test@test.com", password="wrong_pass", role=Role.PATIENT)
        stored_user = LoginResponse(email="test@test.com", password="hashed123", role=Role.PATIENT)

        # MOCK
        expect(repo, times=1).get_user_for_auth(request).thenReturn(stored_user)
        expect(user_services_module, times=1).verify_password("wrong_pass", "hashed123").thenReturn(False)

        # ACT / ASSERT
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(service.authenticate_user(request))
        self.assertEqual(ctx.exception.status_code, 401)

    # ------------------------------------------------------------------ #
    # register_user                                                        #
    # ------------------------------------------------------------------ #

    def test_register_user_new_user_returns_register_response(self) -> None:
        """
        Given no existing user with the same email and role in the DB,
        When register_user is called with valid data,
        Then the password is hashed and the RegisterResponse is returned.
        """
        # PREPARE
        repo = mock(UserRepository)
        service = UserServices(repository=repo)
        request = RegisterRequest(name="New User", email="new@test.com", password="plain123", role=Role.PATIENT)
        auth_check = LoginRequest(email="new@test.com", password="", role=Role.PATIENT)
        expected = RegisterResponse(name="New User", email="new@test.com", role=Role.PATIENT)

        # MOCK
        expect(repo, times=1).get_user_for_auth(auth_check).thenReturn(None)
        expect(user_services_module, times=1).hash_password("plain123").thenReturn("hashed123")
        expect(repo, times=1).create_user(request).thenReturn(expected)

        # ACT
        result = asyncio.run(service.register_user(request))

        # ASSERT
        self.assertEqual(result.email, expected.email)
        self.assertEqual(result.name, expected.name)
        self.assertEqual(result.role, expected.role)

    def test_register_user_duplicate_user_raises_409(self) -> None:
        """
        Given a user with the same email and role already exists in the DB,
        When register_user is called,
        Then an HTTP 409 Conflict exception is raised.
        """
        # PREPARE
        repo = mock(UserRepository)
        service = UserServices(repository=repo)
        request = RegisterRequest(name="Dup User", email="dup@test.com", password="pass", role=Role.PATIENT)
        auth_check = LoginRequest(email="dup@test.com", password="", role=Role.PATIENT)
        existing = LoginResponse(email="dup@test.com", password="hashed", role=Role.PATIENT)

        # MOCK
        expect(repo, times=1).get_user_for_auth(auth_check).thenReturn(existing)

        # ACT / ASSERT
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(service.register_user(request))
        self.assertEqual(ctx.exception.status_code, 409)
