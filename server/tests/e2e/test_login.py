"""TC-01: User Login and Authentication.

Covers all positive, negative, validation, and permission cases defined in
e2e/Rehab360_Process_Flow_and_Test_Cases.md § TC-01.
"""

import re

from playwright.sync_api import Page, expect

from tests.e2e.pages import LandingPage, LoginPage, PatientHomePage


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def _login_as(page: Page, role: str, email: str, password: str) -> LoginPage:
    """Drive the landing → role-select → login form for any role.

    Args:
        page: Playwright Page.
        role: 'patient', 'physiotherapist', or 'trainer'.
        email: User email.
        password: User password.

    Returns:
        LoginPage instance (after form is submitted).
    """
    role_select = LandingPage(page).goto().click_login()
    login = role_select.select_role(role)  # type: ignore[arg-type]
    login.login(email, password)
    return login


# ──────────────────────────────────────────────────────────────────────────────
# TC-01 Positive Cases
# ──────────────────────────────────────────────────────────────────────────────

def test_tc01_p1_patient_login(page: Page) -> None:
    """TC-01-P1 — Successful patient login.

    Given Alice's credentials with the Patient role selected,
    When she submits the login form,
    Then she is redirected to /patient.
    """
    # ACT
    _login_as(page, "patient", "alice@example.com", "1234")

    # ASSERT
    expect(page).to_have_url(re.compile(r".*/patient$"))


def test_tc01_p2_physiotherapist_login(page: Page) -> None:
    """TC-01-P2 — Successful physiotherapist login.

    Given Bob's credentials with the Physiotherapist role selected,
    When he submits the login form,
    Then he is redirected to /physiotherapist/home.
    """
    # ACT
    _login_as(page, "physiotherapist", "bob@physio.com", "1234")

    # ASSERT
    expect(page).to_have_url(re.compile(r".*/physiotherapist/home$"))


def test_tc01_p3_trainer_login(page: Page) -> None:
    """TC-01-P3 — Successful fitness trainer login.

    Given Charlie's credentials with the Fitness Trainer role selected,
    When he submits the login form,
    Then he is redirected to /fitness/home.
    """
    # ACT
    _login_as(page, "trainer", "charlie@gym.com", "1234")

    # ASSERT
    expect(page).to_have_url(re.compile(r".*/fitness/home$"))


def test_tc01_p4_session_persists_on_refresh(page: Page) -> None:
    """TC-01-P4 — Session persists on page refresh.

    Given Alice has logged in (auth stored in localStorage by the app),
    When she refreshes the page,
    Then she remains on the patient dashboard (authAtom rehydrated from localStorage).
    """
    # PREPARE — full UI login so the app itself writes to localStorage
    _login_as(page, "patient", "alice@example.com", "1234")
    expect(page).to_have_url(re.compile(r".*/patient$"))

    # ACT
    page.reload()
    page.wait_for_load_state("networkidle")

    # ASSERT
    expect(page).to_have_url(re.compile(r".*/patient$"))


# ──────────────────────────────────────────────────────────────────────────────
# TC-01 Negative Cases
# ──────────────────────────────────────────────────────────────────────────────

def test_tc01_n1_wrong_password(page: Page) -> None:
    """TC-01-N1 — Wrong password shows error and stays on login.

    Given Alice's email but the wrong password,
    When the form is submitted,
    Then an error message is shown and the URL stays at /login.
    """
    # ACT
    login = _login_as(page, "patient", "alice@example.com", "wrong-password")
    page.wait_for_timeout(1500)

    # ASSERT
    assert login.error_message is not None
    expect(page).to_have_url(re.compile(r".*/login"))


def test_tc01_n2_nonexistent_email(page: Page) -> None:
    """TC-01-N2 — Non-existent email shows error.

    Given an email address that does not exist in the system,
    When the form is submitted,
    Then an error message is shown and no redirect occurs.
    """
    # ACT
    login = _login_as(page, "patient", "nobody@example.com", "1234")
    page.wait_for_timeout(1500)

    # ASSERT
    assert login.error_message is not None
    expect(page).to_have_url(re.compile(r".*/login"))


def test_tc01_n3_wrong_role(page: Page) -> None:
    """TC-01-N3 — Correct credentials but wrong role selected shows error.

    Given Alice's email/password (a PATIENT) but the Physiotherapist role selected,
    When the form is submitted,
    Then the API rejects the request and an error message is shown.
    """
    # ACT — Alice is PATIENT; submitting as PHYSIOTHERAPIST should fail
    login = _login_as(page, "physiotherapist", "alice@example.com", "1234")
    page.wait_for_timeout(1500)

    # ASSERT
    assert login.error_message is not None
    expect(page).to_have_url(re.compile(r".*/login"))


def test_tc01_n4_empty_email_blocked(page: Page) -> None:
    """TC-01-N4 — Empty email field shows validation error.

    Given the login form with a blank email and a filled password,
    When the form is submitted,
    Then a validation error appears on the email field with no API call.
    """
    # PREPARE — go directly to login page (role defaults to 'patient')
    page.goto("/login?role=patient")
    login = LoginPage(page)

    # ACT — leave email blank, fill password, submit
    login.fill_password("1234").submit()
    page.wait_for_timeout(500)

    # ASSERT — field error shown, URL unchanged
    assert login.email_validation_error is not None
    expect(page).to_have_url(re.compile(r".*/login"))


def test_tc01_n5_empty_password_blocked(page: Page) -> None:
    """TC-01-N5 — Empty password field shows validation error.

    Given the login form with a filled email and a blank password,
    When the form is submitted,
    Then a validation error appears on the password field with no API call.
    """
    # PREPARE
    page.goto("/login?role=patient")
    login = LoginPage(page)

    # ACT — fill email, leave password blank, submit
    login.fill_email("alice@example.com").submit()
    page.wait_for_timeout(500)

    # ASSERT
    assert login.password_validation_error is not None
    expect(page).to_have_url(re.compile(r".*/login"))


# ──────────────────────────────────────────────────────────────────────────────
# TC-01 Validation Cases
# ──────────────────────────────────────────────────────────────────────────────

def test_tc01_v1_invalid_email_format_blocked(page: Page) -> None:
    """TC-01-V1 — Invalid email format is rejected before API call.

    Given a malformed email string ('invalid-email'),
    When the form is submitted,
    Then a field-level validation error appears (no network call) and the URL
    stays on /login.
    """
    # PREPARE
    page.goto("/login?role=patient")
    login = LoginPage(page)

    # ACT
    login.fill_email("invalid-email").fill_password("1234").submit()
    page.wait_for_timeout(500)

    # ASSERT — client-side error; no redirect
    assert login.email_validation_error is not None
    expect(page).to_have_url(re.compile(r".*/login"))


# ──────────────────────────────────────────────────────────────────────────────
# TC-01 Permission / Role Tests
# ──────────────────────────────────────────────────────────────────────────────

def test_tc01_r1_patient_cannot_access_physiotherapist_home(patient_page: Page) -> None:
    """TC-01-R1 — Patient navigating to a professional route is redirected home.

    Given Alice is logged in as a PATIENT,
    When she navigates directly to /physiotherapist/home,
    Then RoleRoute redirects her back to /patient.
    """
    # ACT
    patient_page.goto("/physiotherapist/home")
    patient_page.wait_for_load_state("networkidle")

    # ASSERT
    expect(patient_page).to_have_url(re.compile(r".*/patient$"))


def test_tc01_r2_unauthenticated_redirected_from_protected_route(page: Page) -> None:
    """TC-01-R2 — Unauthenticated user is redirected away from protected routes.

    Given no auth state in the browser,
    When the user navigates directly to /patient,
    Then RoleRoute redirects to the landing page ('/').
    """
    # ACT — fresh page, no auth
    page.goto("/patient")
    page.wait_for_load_state("networkidle")

    # ASSERT — ends up on landing page, NOT on /patient
    expect(page).not_to_have_url(re.compile(r".*/patient$"))
    expect(page).to_have_url(re.compile(r".*/$"))


def test_tc01_r3_trainer_cannot_access_physiotherapist_routes(trainer_page: Page) -> None:
    """TC-01-R3 — Fitness Trainer cannot access Physiotherapist routes.

    Given Charlie is logged in as a FITNESS_TRAINER,
    When he navigates directly to /physiotherapist/home,
    Then RoleRoute redirects him to /fitness/home.
    """
    # ACT
    trainer_page.goto("/physiotherapist/home")
    trainer_page.wait_for_load_state("networkidle")

    # ASSERT
    expect(trainer_page).to_have_url(re.compile(r".*/fitness/home$"))


def test_tc01_p4_auth_fixture_bypasses_login_ui(patient_page: Page) -> None:
    """Infrastructure test — pre-authenticated fixture skips the login UI.

    Given the patient_page fixture injects auth via localStorage init script,
    When Alice navigates directly to /patient,
    Then the dashboard loads with her name (no login redirect).
    """
    # ACT
    home = PatientHomePage(patient_page).goto()
    patient_page.wait_for_load_state("networkidle")

    # ASSERT
    assert "Alice" in home.greeting
