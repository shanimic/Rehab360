"""TC-11: Professional Dashboard View and Logout Flow.
TC-17: Route Protection (Cross-Role) — remaining cases not covered by TC-01.

Seed data: Bob (T200/PHYSIOTHERAPIST), Charlie (F300/FITNESS_TRAINER).
Alice (P100/PATIENT) is assigned to both professionals.
"""

import re

from playwright.sync_api import Page, expect

from tests.e2e.pages import LandingPage, PatientDetailsPage, ProfessionalHomePage


# ──────────────────────────────────────────────────────────────────────────────
# TC-11 Positive — Dashboard loads
# ──────────────────────────────────────────────────────────────────────────────

def test_tc11_p1_dashboard_shows_patient_cards(physiotherapist_page: Page) -> None:
    """TC-11-P1 — Professional dashboard shows assigned patient cards.

    Given Bob is authenticated as PHYSIOTHERAPIST,
    When he navigates to /physiotherapist/home,
    Then at least one patient card (Alice Smith) is visible.
    """
    # ACT
    home = ProfessionalHomePage(physiotherapist_page).goto_as_physiotherapist()
    physiotherapist_page.wait_for_load_state("networkidle")

    # ASSERT — Alice's card visible somewhere in the patients section
    expect(
        physiotherapist_page.get_by_role("button", name=re.compile(r"Alice Smith", re.I))
    ).to_be_visible()


def test_tc11_p2_search_filters_patient_list(physiotherapist_page: Page) -> None:
    """TC-11-P2 — Searching by patient name filters the patient list.

    Given the dashboard has patient cards,
    When Bob types 'Alice' in the search box,
    Then only Alice's card remains visible (no 'No results found').
    """
    # ACT
    home = ProfessionalHomePage(physiotherapist_page).goto_as_physiotherapist()
    physiotherapist_page.wait_for_load_state("networkidle")
    home.search_patients("Alice")
    physiotherapist_page.wait_for_timeout(300)

    # ASSERT — Alice card visible, no "no results" message
    expect(
        physiotherapist_page.get_by_role("button", name=re.compile(r"Alice Smith", re.I))
    ).to_be_visible()
    assert not home.no_results_visible


def test_tc11_p2_search_no_match_shows_empty_state(physiotherapist_page: Page) -> None:
    """TC-11-P2 (cont.) — Searching a name that doesn't exist shows empty state.

    Given the dashboard is loaded,
    When Bob searches for 'ZZZNOMATCH',
    Then the 'No results found' message appears.
    """
    # ACT
    home = ProfessionalHomePage(physiotherapist_page).goto_as_physiotherapist()
    physiotherapist_page.wait_for_load_state("networkidle")
    home.search_patients("ZZZNOMATCH")
    physiotherapist_page.wait_for_timeout(300)

    # ASSERT
    assert home.no_results_visible


def test_tc11_p3_click_patient_card_navigates_to_patient_details(physiotherapist_page: Page) -> None:
    """TC-11-P3 — Clicking a patient card opens Patient Details.

    Given Alice's card is visible on the dashboard,
    When Bob clicks it,
    Then he is navigated to Alice's Patient Details page.
    """
    # ACT
    ProfessionalHomePage(physiotherapist_page).goto_as_physiotherapist()
    physiotherapist_page.wait_for_load_state("networkidle")
    physiotherapist_page.get_by_role("button", name=re.compile(r"Alice Smith", re.I)).click()
    physiotherapist_page.wait_for_load_state("networkidle")

    # ASSERT
    expect(physiotherapist_page).to_have_url(re.compile(r".*/physiotherapist/patient/P100$"))


def test_tc11_p4_new_visit_summary_opens_patient_modal(physiotherapist_page: Page) -> None:
    """TC-11-P4 — 'New Visit Summary' button opens the Select Patient modal.

    Given Bob is on the professional dashboard,
    When he clicks 'New Visit Summary',
    Then the Select Patient modal appears.
    """
    # ACT
    home = ProfessionalHomePage(physiotherapist_page).goto_as_physiotherapist()
    physiotherapist_page.wait_for_load_state("networkidle")
    home.click_new_visit_summary()

    # ASSERT
    assert home.is_patient_modal_open


# ──────────────────────────────────────────────────────────────────────────────
# TC-11 Positive — Logout
# ──────────────────────────────────────────────────────────────────────────────

def test_tc11_p5_logout_clears_session_and_returns_to_landing(physiotherapist_page: Page) -> None:
    """TC-11-P5 — Logout clears auth and redirects to the landing page.

    Given Bob is on the professional dashboard,
    When he opens TopNav and clicks Logout,
    Then authAtom is cleared and he lands on '/'.
    """
    # PREPARE
    ProfessionalHomePage(physiotherapist_page).goto_as_physiotherapist()
    physiotherapist_page.wait_for_load_state("networkidle")

    # ACT
    physiotherapist_page.get_by_role("button", name="Open navigation menu").click()
    physiotherapist_page.get_by_role("button", name="Logout").click()
    physiotherapist_page.wait_for_load_state("networkidle")

    # ASSERT — back on landing page
    expect(physiotherapist_page).to_have_url(re.compile(r".*/$"))
    # auth key removed from localStorage
    auth_value = physiotherapist_page.evaluate("() => localStorage.getItem('auth')")
    assert auth_value is None or auth_value == "null"


def test_tc11_p6_protected_route_inaccessible_after_logout(
    physiotherapist_page_once: Page,
) -> None:
    """TC-11-P6 — Protected routes redirect to '/' after logout.

    Given Bob has logged out (auth cleared from localStorage),
    When he navigates to /physiotherapist/home,
    Then RoleRoute redirects to '/' (unauthenticated path).

    Uses physiotherapist_page_once so auth is NOT re-injected on subsequent
    navigations (unlike the standard physiotherapist_page fixture).
    """
    page = physiotherapist_page_once

    # PREPARE — navigate to physio home and then log out
    ProfessionalHomePage(page).goto_as_physiotherapist()
    page.wait_for_load_state("networkidle")
    page.get_by_role("button", name="Open navigation menu").click()
    page.get_by_role("button", name="Logout").click()
    page.wait_for_load_state("networkidle")

    # ACT — try to access protected route again (no init_script re-injects auth)
    page.goto("/physiotherapist/home")
    page.wait_for_load_state("networkidle")

    # ASSERT — redirected to landing
    expect(page).to_have_url(re.compile(r".*/$"))


# ──────────────────────────────────────────────────────────────────────────────
# TC-17: Route Protection (Cross-Role)
# ──────────────────────────────────────────────────────────────────────────────

def test_tc17_r1_patient_redirected_from_physiotherapist_home(patient_page: Page) -> None:
    """TC-17-R1 — Patient navigating to professional home is sent to /patient.

    (Covered more fully in TC-01-R1 — included here for TC-17 completeness.)
    """
    patient_page.goto("/physiotherapist/home")
    patient_page.wait_for_load_state("networkidle")
    expect(patient_page).to_have_url(re.compile(r".*/patient$"))


def test_tc17_r2_physiotherapist_redirected_from_patient_my_plan(physiotherapist_page: Page) -> None:
    """TC-17-R2 — Physiotherapist navigating to /patient/my-plan is redirected.

    Given Bob is authenticated as PHYSIOTHERAPIST,
    When he navigates to /patient/my-plan,
    Then RoleRoute redirects him to /physiotherapist/home.
    """
    physiotherapist_page.goto("/patient/my-plan")
    physiotherapist_page.wait_for_load_state("networkidle")
    expect(physiotherapist_page).to_have_url(re.compile(r".*/physiotherapist/home$"))


def test_tc17_r3_trainer_redirected_from_physiotherapist_patient_route(trainer_page: Page) -> None:
    """TC-17-R3 — Fitness Trainer blocked from a physiotherapist patient route.

    Given Charlie is authenticated as FITNESS_TRAINER,
    When he navigates to /physiotherapist/patient/P100,
    Then RoleRoute redirects him to /fitness/home.
    """
    trainer_page.goto("/physiotherapist/patient/P100")
    trainer_page.wait_for_load_state("networkidle")
    expect(trainer_page).to_have_url(re.compile(r".*/fitness/home$"))


def test_tc17_r4_unauthenticated_redirected_from_any_protected_route(page: Page) -> None:
    """TC-17-R4 — Unauthenticated access to any protected route redirects to '/'.

    Given no auth state,
    When the user navigates to a deep professional route,
    Then RoleRoute redirects to '/'.
    """
    page.goto("/physiotherapist/patient/P100/visit-summaries/102")
    page.wait_for_load_state("networkidle")
    expect(page).to_have_url(re.compile(r".*/$"))


def test_tc17_r5_patient_cannot_access_plan_creation_route(patient_page: Page) -> None:
    """TC-17-R5 — Patient cannot access the treatment plan creation route.

    Given Alice is authenticated as PATIENT,
    When she navigates to a physiotherapist treatment plan creation URL,
    Then RoleRoute redirects her to /patient.
    """
    patient_page.goto("/physiotherapist/patient/P100/treatment-plans/new/999")
    patient_page.wait_for_load_state("networkidle")
    expect(patient_page).to_have_url(re.compile(r".*/patient$"))
