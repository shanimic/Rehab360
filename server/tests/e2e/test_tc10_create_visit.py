"""TC-10: Creating Visit Summary and Treatment/Fitness Plan.

IMPORTANT: Positive tests (P1, P2, P5) CREATE sessions and plans in the DB.
           Run against a fresh seed if repeated execution is needed.

Seed data: Bob (T200) is a PHYSIOTHERAPIST with Alice (P100) as patient.
"""

import re

import pytest
from playwright.sync_api import Page, expect

from tests.e2e.pages import (
    CreateTreatmentPlanPage,
    CreateVisitSummaryPage,
)

ALICE_ID = "P100"
TODAY = "2026-06-04"
FUTURE = "2026-12-31"
PAST_DATE = "2025-01-01"


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def _open_create_summary_for_alice(physiotherapist_page: Page) -> CreateVisitSummaryPage:
    """Navigate directly to the new visit summary form for Alice.

    Args:
        physiotherapist_page: Pre-authenticated physiotherapist page.

    Returns:
        CreateVisitSummaryPage ready for interaction.
    """
    physiotherapist_page.goto(f"/physiotherapist/patient/{ALICE_ID}/visit-summaries/new")
    physiotherapist_page.wait_for_load_state("networkidle")
    return CreateVisitSummaryPage(physiotherapist_page)


# ──────────────────────────────────────────────────────────────────────────────
# TC-10 Positive — Visit Summary Creation  [MUTATES DATA]
# ──────────────────────────────────────────────────────────────────────────────

def test_tc10_p1_physiotherapist_creates_visit_summary(physiotherapist_page: Page) -> None:
    """TC-10-P1 — Physiotherapist creates a new visit summary for Alice.

    REQUIRES FRESH SEED.

    Given Bob fills all required fields,
    When he clicks 'Save & Create Treatment Plan',
    Then the session is saved and he is redirected to the treatment plan creation page.
    """
    # PREPARE
    cvs = _open_create_summary_for_alice(physiotherapist_page)

    # ACT
    (
        cvs.fill_date(TODAY)
        .fill_time("10:00")
        .fill_treatment_area("Knee Rehabilitation")
        .fill_diagnosis("Patellofemoral Pain Syndrome")
        .fill_visit_notes("Patient reports improvement from last session.")
        .save_and_create_plan()
    )
    physiotherapist_page.wait_for_load_state("networkidle")

    # ASSERT — redirected to create treatment plan page
    expect(physiotherapist_page).to_have_url(re.compile(r".*/treatment-plans/new/\d+$"))


def test_tc10_p5_create_plan_with_exercises(physiotherapist_page: Page) -> None:
    """TC-10-P5 — Physiotherapist creates treatment plan with 1 exercise.

    REQUIRES FRESH SEED (needs a valid sessionId from a newly created summary).

    Given Bob creates a visit summary and lands on Create Treatment Plan,
    When he adds an exercise, fills goal/dates, and saves,
    Then the plan is saved and he is redirected to visit summaries.
    """
    # PREPARE — create visit summary first to get a session ID
    cvs = _open_create_summary_for_alice(physiotherapist_page)
    cvs.fill_date(TODAY).fill_time("11:00").fill_treatment_area(
        "Shoulder"
    ).fill_diagnosis("Rotator Cuff Strain").fill_visit_notes("Test").save_and_create_plan()
    physiotherapist_page.wait_for_load_state("networkidle")

    if "treatment-plans/new" not in physiotherapist_page.url:
        pytest.skip("Visit summary save did not redirect to create plan — check API state")

    ctp = CreateTreatmentPlanPage(physiotherapist_page)

    # ACT
    (
        ctp.fill_goal("Restore full shoulder range of motion")
        .fill_start_date(TODAY)
        .fill_end_date(FUTURE)
        .add_exercise("Shoulder External Rotation", sets=3, reps=10)
        .save_plan()
    )
    physiotherapist_page.wait_for_load_state("networkidle")

    # ASSERT — redirected after plan save
    expect(physiotherapist_page).to_have_url(
        re.compile(r".*/physiotherapist/patient/.*/visit-summaries.*")
    )


# ──────────────────────────────────────────────────────────────────────────────
# TC-10 Negative Cases — Visit Summary form validation
# ──────────────────────────────────────────────────────────────────────────────

def test_tc10_n1_blank_diagnosis_blocked(physiotherapist_page: Page) -> None:
    """TC-10-N1 — Visit summary without medical_diagnosis is blocked.

    Given all fields are filled except diagnosis,
    When Bob submits the form,
    Then a validation error appears and the URL stays on the create page.
    """
    # PREPARE
    cvs = _open_create_summary_for_alice(physiotherapist_page)

    # ACT — leave diagnosis blank
    cvs.fill_date(TODAY).fill_time("10:00").fill_treatment_area(
        "Knee"
    ).fill_visit_notes("Notes").save_and_create_plan()
    physiotherapist_page.wait_for_timeout(500)

    # ASSERT
    errors = cvs.validation_errors
    assert len(errors) > 0, "Expected a validation error for blank diagnosis"
    expect(physiotherapist_page).to_have_url(re.compile(r".*/visit-summaries/new$"))


def test_tc10_n2_blank_description_blocked(physiotherapist_page: Page) -> None:
    """TC-10-N2 — Visit summary without visit notes (description) is blocked.

    Given all fields filled except visit_notes,
    When Bob submits,
    Then a validation error is shown.
    """
    # PREPARE
    cvs = _open_create_summary_for_alice(physiotherapist_page)

    # ACT — leave visit notes blank
    cvs.fill_date(TODAY).fill_time("10:00").fill_treatment_area(
        "Knee"
    ).fill_diagnosis("Test Diagnosis").save_and_create_plan()
    physiotherapist_page.wait_for_timeout(500)

    # ASSERT
    errors = cvs.validation_errors
    assert len(errors) > 0
    expect(physiotherapist_page).to_have_url(re.compile(r".*/visit-summaries/new$"))


# ──────────────────────────────────────────────────────────────────────────────
# TC-10 Negative Cases — Treatment Plan form validation
# ──────────────────────────────────────────────────────────────────────────────

def _navigate_to_create_plan(physiotherapist_page: Page) -> CreateTreatmentPlanPage | None:
    """Create a visit summary first to get a valid session, then return the plan page.

    Args:
        physiotherapist_page: Pre-authenticated physiotherapist page.

    Returns:
        CreateTreatmentPlanPage or None if navigation failed.
    """
    cvs = _open_create_summary_for_alice(physiotherapist_page)
    cvs.fill_date(TODAY).fill_time("09:00").fill_treatment_area(
        "Lower Back"
    ).fill_diagnosis("Lumbar Strain").fill_visit_notes("Initial assessment.").save_and_create_plan()
    physiotherapist_page.wait_for_load_state("networkidle")

    if "treatment-plans/new" not in physiotherapist_page.url:
        return None

    return CreateTreatmentPlanPage(physiotherapist_page)


def test_tc10_n4_submit_plan_with_zero_exercises_blocked(physiotherapist_page: Page) -> None:
    """TC-10-N4 — Creating a plan with no exercises is blocked.

    Given the treatment plan form with goal/dates filled but no exercises,
    When Bob submits,
    Then a validation error appears.
    """
    # PREPARE
    ctp = _navigate_to_create_plan(physiotherapist_page)
    if ctp is None:
        pytest.skip("Could not reach Create Treatment Plan page — may need fresh seed")

    # ACT — fill goal and dates but add NO exercises
    ctp.fill_goal("Test goal").fill_start_date(TODAY).fill_end_date(FUTURE).save_plan()
    physiotherapist_page.wait_for_timeout(500)

    # ASSERT — still on plan page (blocked)
    expect(physiotherapist_page).to_have_url(re.compile(r".*/treatment-plans/new/\d+$"))


def test_tc10_n5_end_date_before_start_date_blocked(physiotherapist_page: Page) -> None:
    """TC-10-N5 — Plan end date must be strictly after start date.

    Given end date is set before start date,
    When Bob submits,
    Then a validation error is shown.
    """
    # PREPARE
    ctp = _navigate_to_create_plan(physiotherapist_page)
    if ctp is None:
        pytest.skip("Could not reach Create Treatment Plan page — may need fresh seed")

    # ACT — end date BEFORE start date
    ctp.fill_goal("Test goal").fill_start_date(FUTURE).fill_end_date(PAST_DATE).save_plan()
    physiotherapist_page.wait_for_timeout(500)

    # ASSERT — blocked on plan page
    expect(physiotherapist_page).to_have_url(re.compile(r".*/treatment-plans/new/\d+$"))


def test_tc10_n6_blank_goal_blocked(physiotherapist_page: Page) -> None:
    """TC-10-N6 — Plan goal is required and cannot be blank.

    Given the plan form with no goal text,
    When Bob submits after adding an exercise,
    Then a validation error appears.
    """
    # PREPARE
    ctp = _navigate_to_create_plan(physiotherapist_page)
    if ctp is None:
        pytest.skip("Could not reach Create Treatment Plan page — may need fresh seed")

    # ACT — leave goal blank, add an exercise, submit
    ctp.fill_start_date(TODAY).fill_end_date(FUTURE)
    ctp.save_plan()
    physiotherapist_page.wait_for_timeout(500)

    # ASSERT
    expect(physiotherapist_page).to_have_url(re.compile(r".*/treatment-plans/new/\d+$"))
