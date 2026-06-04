"""Shared pytest fixtures for e2e tests.

Auth fixtures use the real backend API to obtain tokens once per session,
then inject them into each test's localStorage so tests start pre-authenticated
without going through the login UI.
"""

import json

import httpx
import pytest
from playwright.sync_api import Page

API_BASE = "http://localhost:8000"

_SEED_CREDENTIALS: dict[str, dict[str, str]] = {
    "patient": {
        "email": "alice@example.com",
        "password": "1234",
        "role": "PATIENT",
    },
    "physiotherapist": {
        "email": "bob@physio.com",
        "password": "1234",
        "role": "PHYSIOTHERAPIST",
    },
    "trainer": {
        "email": "charlie@gym.com",
        "password": "1234",
        "role": "FITNESS_TRAINER",
    },
}


@pytest.fixture(scope="session")
def base_url() -> str:
    """Base URL for the Vite dev server used by all e2e tests."""
    return "http://localhost:5173"


# ------------------------------------------------------------------
# Session-scoped auth data (one API call per role per test run)
# ------------------------------------------------------------------


@pytest.fixture(scope="session")
def patient_auth() -> dict:
    """Fetch and cache the LoginResponse for the seed patient (Alice).

    Returns:
        LoginResponse dict stored in localStorage as the 'auth' key.
    """
    return _fetch_auth("patient")


@pytest.fixture(scope="session")
def physiotherapist_auth() -> dict:
    """Fetch and cache the LoginResponse for the seed physiotherapist (Bob).

    Returns:
        LoginResponse dict stored in localStorage as the 'auth' key.
    """
    return _fetch_auth("physiotherapist")


@pytest.fixture(scope="session")
def trainer_auth() -> dict:
    """Fetch and cache the LoginResponse for the seed fitness trainer (Charlie).

    Returns:
        LoginResponse dict stored in localStorage as the 'auth' key.
    """
    return _fetch_auth("trainer")


# ------------------------------------------------------------------
# Function-scoped pre-authenticated pages
# ------------------------------------------------------------------


@pytest.fixture
def patient_page(page: Page, patient_auth: dict) -> Page:
    """Return a Page pre-authenticated as Alice (PATIENT).

    Call page.goto('/patient') after receiving this fixture.

    Args:
        page: Playwright Page (function-scoped).
        patient_auth: Session-scoped auth dict.

    Returns:
        Page with auth injected into localStorage.
    """
    _inject_auth(page, patient_auth)
    return page


@pytest.fixture
def physiotherapist_page(page: Page, physiotherapist_auth: dict) -> Page:
    """Return a Page pre-authenticated as Bob (PHYSIOTHERAPIST).

    Args:
        page: Playwright Page (function-scoped).
        physiotherapist_auth: Session-scoped auth dict.

    Returns:
        Page with auth injected into localStorage.
    """
    _inject_auth(page, physiotherapist_auth)
    return page


@pytest.fixture
def trainer_page(page: Page, trainer_auth: dict) -> Page:
    """Return a Page pre-authenticated as Charlie (FITNESS_TRAINER).

    Args:
        page: Playwright Page (function-scoped).
        trainer_auth: Session-scoped auth dict.

    Returns:
        Page with auth injected into localStorage.
    """
    _inject_auth(page, trainer_auth)
    return page


@pytest.fixture
def physiotherapist_page_once(page: Page, base_url: str, physiotherapist_auth: dict) -> Page:
    """Return a Page authenticated as Bob via a single localStorage.setItem() call.

    Unlike physiotherapist_page, this fixture does NOT use add_init_script, so
    auth is NOT re-injected on subsequent navigations.  Use this for tests that
    check post-logout redirect behaviour (logout clears auth; next navigation
    must see an empty localStorage to trigger the RoleRoute redirect).

    Args:
        page: Playwright Page (function-scoped).
        base_url: Base URL for the Vite dev server.
        physiotherapist_auth: Session-scoped auth dict.

    Returns:
        Page with auth written into localStorage once via page.evaluate().
    """
    auth_json = json.dumps(physiotherapist_auth)
    # Navigate to the origin first so localStorage.setItem targets the right origin.
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    page.evaluate(f"window.localStorage.setItem('auth', JSON.stringify({auth_json}))")
    return page


# ------------------------------------------------------------------
# Private helpers
# ------------------------------------------------------------------


def _fetch_auth(role: str) -> dict:
    """Call POST /users/login and return the response body.

    Args:
        role: Key in _SEED_CREDENTIALS ('patient', 'physiotherapist', 'trainer').

    Returns:
        LoginResponse dict from the API.

    Raises:
        httpx.HTTPStatusError: If the login request fails.
    """
    creds = _SEED_CREDENTIALS[role]
    response = httpx.post(
        f"{API_BASE}/users/login",
        json={"email": creds["email"], "password": creds["password"], "role": creds["role"]},
        timeout=10,
    )
    response.raise_for_status()
    return response.json()


def _inject_auth(page: Page, auth: dict) -> None:
    """Register an init script that seeds localStorage before each navigation.

    This makes Jotai's atomWithStorage pick up the auth state on first load.

    Args:
        page: The Playwright Page to configure.
        auth: LoginResponse dict to store under the 'auth' localStorage key.
    """
    auth_json = json.dumps(auth)
    page.add_init_script(f"localStorage.setItem('auth', JSON.stringify({auth_json}))")
