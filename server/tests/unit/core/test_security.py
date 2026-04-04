"""Unit tests for password hashing helpers."""

import unittest

from pwdlib.exceptions import UnknownHashError

from app.core.security import hash_password, verify_password


class SecurityTest(unittest.TestCase):
    def test_hash_password_then_verify_same_plain_succeeds(self) -> None:
        """
        Given a plaintext password,
        When it is hashed and verify_password is called with the same plaintext,
        Then verification returns True.
        """
        # PREPARE
        plain = "correct-horse-battery-staple"

        # ACT
        hashed = hash_password(plain)
        ok = verify_password(plain, hashed)

        # ASSERT
        assert ok is True

    def test_verify_password_wrong_plain_returns_false(self) -> None:
        """
        Given a stored hash for one password,
        When verify_password is called with a different plaintext,
        Then verification returns False.
        """
        # PREPARE
        hashed = hash_password("original-secret")

        # ACT
        ok = verify_password("different-secret", hashed)

        # ASSERT
        assert ok is False

    def test_verify_password_unknown_hash_raises(self) -> None:
        """
        Given a string that pwdlib cannot identify as any supported hash,
        When verify_password is called,
        Then UnknownHashError is raised.
        """
        # PREPARE
        bogus_hash = "not-a-valid-hash"

        # ACT / ASSERT
        try:
            verify_password("any-password", bogus_hash)
            assert False, "Expected UnknownHashError"
        except UnknownHashError:
            pass
