"""Unit tests for health check route."""

import unittest

from fastapi.testclient import TestClient

from app.main import app


class HealthRoutesTest(unittest.TestCase):
    def test_health_check_returns_healthy(self) -> None:
        """
        Given the app is running,
        When GET /health is requested,
        Then the response is 200 with status healthy.
        """
        # PREPARE
        client = TestClient(app)

        # ACT
        response = client.get("/health")

        # ASSERT
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}
