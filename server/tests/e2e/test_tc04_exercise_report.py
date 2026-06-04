"""TC-04: Exercise Reporting Flow.

Seed data notes:
- Wall Squats (ex 1): already COMPLETED for today → mp-card--completed, disabled.
- Plank (ex 3): already NOT COMPLETED for today → may appear with a status.
- Shoulder External Rotation (ex 2): unreported today → use for positive tests.

IMPORTANT: Positive tests (P1, P4) that submit a report mutate the database.
Re-run only against a fresh seed (re-execute db/init.sql).
"""

import re

import pytest
from playwright.sync_api import Page, expect

from tests.e2e.pages import ExerciseReportPage, MyPlanPage


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def _navigate_to_active_exercise(patient_page: Page) -> str | None:
    """Navigate from My Plan to the first unreported exercise.

    Args:
        patient_page: Pre-authenticated patient page.

    Returns:
        The exercise name if navigation succeeded, else None.
    """
    MyPlanPage(patient_page).goto()
    patient_page.wait_for_load_state("networkidle")

    # Find first card that is neither completed nor tomorrow-locked
    active = patient_page.locator(".mp-card:not(.mp-card--completed):not(.mp-card--tomorrow)")
    if active.count() == 0:
        return None

    name_el = active.first.locator(".mp-card__name")
    name = name_el.inner_text() if name_el.count() > 0 else "unknown"
    active.first.click()
    patient_page.wait_for_url("**/exercise/**")
    return name


# ──────────────────────────────────────────────────────────────────────────────
# TC-04 Positive Cases  (require fresh seed)
# ──────────────────────────────────────────────────────────────────────────────

def test_tc04_p1_report_exercise_as_completed(patient_page: Page) -> None:
    """TC-04-P1 — Reporting an exercise as completed saves and returns to My Plan.

    REQUIRES FRESH SEED — submits a new exercise report.

    Given an unreported exercise is in today's plan,
    When the patient marks it Completed with pain=3, effort=5 and submits,
    Then she is redirected back to /patient/my-plan.
    """
    # PREPARE
    exercise_name = _navigate_to_active_exercise(patient_page)
    if exercise_name is None:
        pytest.skip("No unreported exercises today — re-seed DB with db/init.sql")

    report = ExerciseReportPage(patient_page)
    assert not report.is_empty_state, "Expected exercise report form, got empty state"

    # ACT
    report.click_completed().set_pain(3).set_effort(5).submit()
    patient_page.wait_for_load_state("networkidle")

    # ASSERT
    expect(patient_page).to_have_url(re.compile(r".*/my-plan$"))


def test_tc04_p4_report_exercise_as_not_completed(patient_page: Page) -> None:
    """TC-04-P4 — Reporting 'Not Completed' with a reason saves and returns.

    REQUIRES FRESH SEED — submits a new exercise report.

    Given an unreported exercise is in today's plan,
    When the patient marks it Not Completed with a reason and submits,
    Then she is redirected back to /patient/my-plan.
    """
    # PREPARE
    exercise_name = _navigate_to_active_exercise(patient_page)
    if exercise_name is None:
        pytest.skip("No unreported exercises today — re-seed DB with db/init.sql")

    report = ExerciseReportPage(patient_page)
    assert not report.is_empty_state

    # ACT
    report.click_not_completed().fill_not_completed_reason(
        "Felt sharp pain in the joint"
    ).submit()
    patient_page.wait_for_load_state("networkidle")

    # ASSERT
    expect(patient_page).to_have_url(re.compile(r".*/my-plan$"))


# ──────────────────────────────────────────────────────────────────────────────
# TC-04 Negative Cases
# ──────────────────────────────────────────────────────────────────────────────

def test_tc04_n1_save_disabled_before_selecting_completion(patient_page: Page) -> None:
    """TC-04-N1 — Save button is disabled when no completion status is selected.

    Given the exercise report page is open,
    When neither Completed nor Not Completed has been selected,
    Then the Save button is disabled.
    """
    # PREPARE
    exercise_name = _navigate_to_active_exercise(patient_page)
    if exercise_name is None:
        pytest.skip("No active exercise to open — re-seed DB")

    # ASSERT — save is disabled by default (no selection yet)
    report = ExerciseReportPage(patient_page)
    assert not report.is_empty_state
    assert report.is_save_disabled, "Expected Save to be disabled before selecting completion status"


def test_tc04_n2_not_completed_reason_required(patient_page: Page) -> None:
    """TC-04-N2 — Selecting 'Not Completed' without filling reason blocks submit.

    Given the exercise report page is open and 'Not Completed' is selected,
    When the patient leaves the reason field blank and tries to save,
    Then the Save button remains disabled.
    """
    # PREPARE
    exercise_name = _navigate_to_active_exercise(patient_page)
    if exercise_name is None:
        pytest.skip("No active exercise to open — re-seed DB")

    # ACT
    report = ExerciseReportPage(patient_page)
    report.click_not_completed()
    # Reason left blank

    # ASSERT — save must remain disabled
    assert report.is_save_disabled, "Expected Save to be disabled when reason is blank"


def test_tc04_n3_whitespace_only_reason_blocked(patient_page: Page) -> None:
    """TC-04-N3 — Whitespace-only reason for non-completion is treated as empty.

    Given 'Not Completed' is selected and only spaces are entered in the reason,
    When the patient tries to save,
    Then the Save button is still disabled.
    """
    # PREPARE
    exercise_name = _navigate_to_active_exercise(patient_page)
    if exercise_name is None:
        pytest.skip("No active exercise to open — re-seed DB")

    # ACT
    report = ExerciseReportPage(patient_page)
    report.click_not_completed().fill_not_completed_reason("   ")

    # ASSERT
    assert report.is_save_disabled, "Expected Save to be disabled for whitespace-only reason"


# ──────────────────────────────────────────────────────────────────────────────
# TC-04 Validation Cases
# ──────────────────────────────────────────────────────────────────────────────

def test_tc04_v1_pain_level_enforces_bounds(patient_page: Page) -> None:
    """TC-04-V1 — Pain level stays within 0–10 after Decrease button spam.

    Given the exercise report page is open,
    When the Decrease Pain button is clicked more than 10 times,
    Then pain value does not go below 0.
    """
    # PREPARE
    exercise_name = _navigate_to_active_exercise(patient_page)
    if exercise_name is None:
        pytest.skip("No active exercise to open — re-seed DB")

    # ACT — click Decrease Pain 15 times (more than possible range)
    decrease = patient_page.get_by_role("button", name="Decrease Pain")
    for _ in range(15):
        decrease.click()

    # ASSERT
    report = ExerciseReportPage(patient_page)
    assert report.pain_value == 0, f"Expected pain=0, got {report.pain_value}"


def test_tc04_v2_effort_level_enforces_bounds(patient_page: Page) -> None:
    """TC-04-V2 — Effort level stays within 0–10 after Increase button spam.

    Given the exercise report page is open,
    When the Increase Effort button is clicked more than 10 times,
    Then effort value does not exceed 10.
    """
    # PREPARE
    exercise_name = _navigate_to_active_exercise(patient_page)
    if exercise_name is None:
        pytest.skip("No active exercise to open — re-seed DB")

    # ACT
    increase = patient_page.get_by_role("button", name="Increase Effort")
    for _ in range(15):
        increase.click()

    # ASSERT
    report = ExerciseReportPage(patient_page)
    assert report.effort_value == 10, f"Expected effort=10, got {report.effort_value}"


def test_tc04_empty_state_on_direct_url_navigation(patient_page: Page) -> None:
    """Navigation guard — direct URL to exercise report shows empty state.

    Given no location state is provided,
    When a patient navigates directly to /patient/exercise/1,
    Then the empty state ('No exercise data found') is displayed.
    """
    # ACT
    patient_page.goto("/patient/exercise/1")
    patient_page.wait_for_load_state("networkidle")

    # ASSERT
    report = ExerciseReportPage(patient_page)
    assert report.is_empty_state
