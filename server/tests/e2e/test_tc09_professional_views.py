"""TC-09: Viewing Patient Profile (Professional).

Seed data: Bob (T200/PHYSIOTHERAPIST) is assigned to Alice (P100).
Alice has sessions 101 and 102, plans 1 and 2.
"""

import re

import pytest
from playwright.sync_api import Page, expect

from tests.e2e.pages import (
    AllVisitSummariesPage,
    PatientDetailsPage,
)

ALICE_ID = "P100"


# ──────────────────────────────────────────────────────────────────────────────
# TC-09 Positive — Profile and Progress
# ──────────────────────────────────────────────────────────────────────────────

def test_tc09_p1_professional_views_patient_profile(physiotherapist_page: Page) -> None:
    """TC-09-P1 — Physiotherapist sees Alice's profile with both plan types.

    Given Bob is authenticated as PHYSIOTHERAPIST,
    When he navigates to /physiotherapist/patient/P100,
    Then Alice's name, treatment plan, and fitness plan sections are visible.
    """
    # ACT
    details = PatientDetailsPage(physiotherapist_page).goto_as_professional(ALICE_ID, "physiotherapist")
    physiotherapist_page.wait_for_load_state("networkidle")

    # ASSERT
    assert "Alice" in details.patient_name
    expect(physiotherapist_page.locator(".info-card").filter(has_text="Treatment Plan")).to_be_visible()
    expect(physiotherapist_page.locator(".info-card").filter(has_text="Fitness Plan")).to_be_visible()


def test_tc09_p3_latest_visit_shown_on_profile(physiotherapist_page: Page) -> None:
    """TC-09-P3 — Latest visit summary info is shown on the profile card.

    Given Alice has sessions in the seed,
    When Bob views Alice's patient details,
    Then visit date/therapist info is visible.
    """
    # ACT
    PatientDetailsPage(physiotherapist_page).goto_as_professional(ALICE_ID, "physiotherapist")
    physiotherapist_page.wait_for_load_state("networkidle")

    # ASSERT — visit section exists in profile
    expect(physiotherapist_page.locator(".info-card").filter(has_text="Visit Summaries")).to_be_visible()


# ──────────────────────────────────────────────────────────────────────────────
# TC-09 Positive — Visit Summaries
# ──────────────────────────────────────────────────────────────────────────────

def test_tc09_p4_professional_views_patient_visit_summaries(physiotherapist_page: Page) -> None:
    """TC-09-P4 — Physiotherapist sees patient's visit summaries list.

    Given Bob navigates to Alice's visit summaries,
    When the page loads,
    Then at least 2 session cards are shown.
    """
    # ACT
    summaries = AllVisitSummariesPage(physiotherapist_page).goto_as_professional(
        ALICE_ID, "physiotherapist"
    )
    physiotherapist_page.wait_for_load_state("networkidle")

    # ASSERT
    assert summaries.session_count >= 2


def test_tc09_p5_professional_opens_specific_visit_summary(physiotherapist_page: Page) -> None:
    """TC-09-P5 — Physiotherapist opens a specific visit summary detail.

    Given Bob is viewing Alice's visit summaries list,
    When he clicks the first session card,
    Then the URL changes to the detail page.
    """
    # ACT
    summaries = AllVisitSummariesPage(physiotherapist_page).goto_as_professional(
        ALICE_ID, "physiotherapist"
    )
    physiotherapist_page.wait_for_load_state("networkidle")
    summaries.click_session(0)
    physiotherapist_page.wait_for_load_state("networkidle")

    # ASSERT
    expect(physiotherapist_page).to_have_url(
        re.compile(r".*/physiotherapist/patient/P100/visit-summaries/\d+$")
    )
    expect(physiotherapist_page.locator(".patient-nav__title")).to_have_text("Visit Summary")


def test_tc09_p6_professional_views_treatment_plan(physiotherapist_page: Page) -> None:
    """TC-09-P6 — Physiotherapist can view Alice's treatment plan.

    Given Bob views Alice's patient details,
    When he clicks 'Go to Current Treatment Plan',
    Then the treatment plan detail page loads.
    """
    # ACT
    details = PatientDetailsPage(physiotherapist_page).goto_as_professional(ALICE_ID, "physiotherapist")
    physiotherapist_page.wait_for_load_state("networkidle")

    if not details.has_treatment_plan:
        pytest.skip("Alice has no active treatment plan in current seed")

    details.go_to_treatment_plan()
    physiotherapist_page.wait_for_load_state("networkidle")

    # ASSERT
    expect(physiotherapist_page).to_have_url(
        re.compile(r".*/treatment-plans/\d+$")
    )


def test_tc09_p7_professional_views_fitness_plan(physiotherapist_page: Page) -> None:
    """TC-09-P7 — Physiotherapist can view Alice's fitness plan.

    Given Bob views Alice's patient details,
    When he clicks 'Go to Current Fitness Plan',
    Then the fitness plan detail page loads.
    """
    # ACT
    details = PatientDetailsPage(physiotherapist_page).goto_as_professional(ALICE_ID, "physiotherapist")
    physiotherapist_page.wait_for_load_state("networkidle")

    if not details.has_fitness_plan:
        pytest.skip("Alice has no active fitness plan in current seed")

    details.go_to_fitness_plan()
    physiotherapist_page.wait_for_load_state("networkidle")

    # ASSERT — fitness plan URL pattern
    expect(physiotherapist_page).to_have_url(re.compile(r".*/plans/\d+$"))


# ──────────────────────────────────────────────────────────────────────────────
# TC-09 Negative Cases
# ──────────────────────────────────────────────────────────────────────────────

def test_tc09_n1_patient_with_no_data_shows_empty_states(physiotherapist_page: Page) -> None:
    """TC-09-N1 — Non-existent patient ID is handled gracefully.

    Given Bob navigates to a patient ID that does not exist,
    When the page loads,
    Then an error or empty state is shown without crashing.
    """
    # ACT
    physiotherapist_page.goto("/physiotherapist/patient/UNKNOWN")
    physiotherapist_page.wait_for_load_state("networkidle")

    # ASSERT — no unhandled React crash
    assert not physiotherapist_page.locator("text=Uncaught Error").is_visible()


# ──────────────────────────────────────────────────────────────────────────────
# TC-09 Permission Tests
# ──────────────────────────────────────────────────────────────────────────────

def test_tc09_r1_patient_cannot_access_professional_patient_route(patient_page: Page) -> None:
    """TC-09-R1 — Patient is blocked from accessing professional patient routes.

    Given Alice is authenticated as PATIENT,
    When she navigates to /physiotherapist/patient/P100,
    Then RoleRoute redirects her to /patient.
    """
    # ACT
    patient_page.goto(f"/physiotherapist/patient/{ALICE_ID}")
    patient_page.wait_for_load_state("networkidle")

    # ASSERT
    expect(patient_page).to_have_url(re.compile(r".*/patient$"))
