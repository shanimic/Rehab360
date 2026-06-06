"""TC-02: User Registration.

NOTE: Positive tests (P1, P2, P3) create new users in the database.
      Run against a fresh seed if you need to re-run them with the same IDs,
      or rely on the uuid-based unique values generated at test time.
"""

import uuid

from playwright.sync_api import Page, expect

from tests.e2e.pages import LandingPage, SignUpPage


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def _unique(prefix: str) -> str:
    """Return a short unique string prefixed with *prefix*.

    Args:
        prefix: Short label (e.g. 'P', 'T').

    Returns:
        String like 'P-a1b2c3'.
    """
    return f"{prefix}-{uuid.uuid4().hex[:6]}"


def _signup_page_for_patient(page: Page) -> SignUpPage:
    """Drive landing → role-select → /signup for the Patient role.

    Args:
        page: Playwright Page.

    Returns:
        SignUpPage ready for field-filling.
    """
    role_select = LandingPage(page).goto().click_signup()
    return role_select.select_role_for_signup("patient")


# ──────────────────────────────────────────────────────────────────────────────
# TC-02 Positive Cases
# ──────────────────────────────────────────────────────────────────────────────

def test_tc02_p1_patient_registration(page: Page) -> None:
    """TC-02-P1 — Patient registration with all required fields.

    Given a new unique patient filling in all required fields,
    When the form is submitted,
    Then the account is created and the user is redirected away from /signup.
    """
    # PREPARE
    signup = _signup_page_for_patient(page)
    uid = _unique("P")
    email = f"{uid}@test.example.com"

    # ACT
    signup.fill_patient_form(
        user_id=uid,
        first_name="Test",
        last_name="Patient",
        email=email,
        password="Password1!",
        phone="050-9999999",
        birth_date="1995-06-15",
    ).submit()
    page.wait_for_load_state("networkidle")

    # ASSERT — redirect away from /signup (lands on / due to /dashboard not existing)
    expect(page).not_to_have_url("**/signup**")


def test_tc02_p2_physiotherapist_registration_with_license(page: Page) -> None:
    """TC-02-P2 — Physiotherapist registration includes license number.

    Given a professional filling all fields including license_number,
    When the form is submitted,
    Then the account is created.
    """
    # PREPARE
    role_select = LandingPage(page).goto().click_signup()
    signup = role_select.select_role_for_signup("physiotherapist")
    uid = _unique("T")

    # ACT
    signup.fill_patient_form(
        user_id=uid,
        first_name="Test",
        last_name="Physio",
        email=f"{uid}@physio.example.com",
        password="Password1!",
        phone="052-8888888",
        birth_date="1980-03-20",
    ).fill_license_number("LIC-TEMP").submit()
    page.wait_for_load_state("networkidle")

    # ASSERT
    expect(page).not_to_have_url("**/signup**")


# ──────────────────────────────────────────────────────────────────────────────
# TC-02 Negative Cases
# ──────────────────────────────────────────────────────────────────────────────

def test_tc02_n1_duplicate_email_shows_error(page: Page) -> None:
    """TC-02-N1 — Duplicate email is rejected by the API.

    Given alice@example.com is already in the database,
    When a new registration is submitted with that email,
    Then an error message is shown and the URL stays on /signup.
    """
    # PREPARE
    page.goto("/signup")
    signup = SignUpPage(page)
    uid = _unique("P")

    # ACT — use Alice's existing email
    signup.fill_patient_form(
        user_id=uid,
        first_name="Duplicate",
        last_name="User",
        email="alice@example.com",
        password="Password1!",
        phone="050-1111111",
        birth_date="1990-01-01",
    ).submit()
    page.wait_for_timeout(1500)

    # ASSERT
    assert signup.has_any_error
    expect(page).to_have_url("**/signup**")


def test_tc02_n2_missing_first_name_blocked(page: Page) -> None:
    """TC-02-N2 — Missing required field (first_name) shows validation error.

    Given a form with all fields filled except first_name,
    When submitted,
    Then a field-level validation error appears.
    """
    # PREPARE
    page.goto("/signup")
    signup = SignUpPage(page)
    uid = _unique("P")

    # ACT — skip first_name
    signup.fill_user_id(uid).fill_last_name("Test").fill_email(
        f"{uid}@test.example.com"
    ).fill_password("Password1!").fill_phone("050-1111111").fill_birth_date(
        "1990-01-01"
    ).submit()
    page.wait_for_timeout(500)

    # ASSERT
    assert signup.has_any_error
    expect(page).to_have_url("**/signup**")


def test_tc02_n4_password_too_short_blocked(page: Page) -> None:
    """TC-02-N4 — Password shorter than 8 characters is rejected.

    Given a password of only 3 characters,
    When the form is submitted,
    Then a validation error is shown on the password field.
    """
    # PREPARE
    page.goto("/signup")
    signup = SignUpPage(page)
    uid = _unique("P")

    # ACT
    signup.fill_patient_form(
        user_id=uid,
        first_name="Test",
        last_name="User",
        email=f"{uid}@test.example.com",
        password="abc",
        phone="050-1111111",
        birth_date="1990-01-01",
    ).submit()
    page.wait_for_timeout(500)

    # ASSERT
    assert signup.has_any_error
    expect(page).to_have_url("**/signup**")
