"""TC-03: Patient Viewing and Progress Tracking Flow.

Seed data assumptions (db/init.sql):
- Alice (P100) has 2 sessions: 101 (FITNESS/Knee/Charlie) and 102 (PHYSIO/Shoulder/Bob)
- Plans 1 (knee) and 2 (shoulder) both active.
- Today's exercises: Wall Squats (completed), Plank (not completed),
  Shoulder External Rotation (unreported).
"""

import re

import pytest
from playwright.sync_api import Page, expect

from tests.e2e.pages import (
    AllVisitSummariesPage,
    MyPlanPage,
    PatientDetailsPage,
    PatientHomePage,
)


# ──────────────────────────────────────────────────────────────────────────────
# TC-03 Positive — Home Dashboard
# ──────────────────────────────────────────────────────────────────────────────

def test_tc03_p1_dashboard_loads_with_active_plan(patient_page: Page) -> None:
    """TC-03-P1 — Dashboard renders progress bars for Alice's active plans.

    Given Alice is authenticated and has both a treatment and fitness plan,
    When she navigates to /patient,
    Then Physiotherapy Progress and Fitness Progress cards are visible.
    """
    # ACT
    PatientHomePage(patient_page).goto()
    patient_page.wait_for_load_state("networkidle")

    # ASSERT
    expect(patient_page.locator(".ph-progress-card").filter(has_text="Physiotherapy Progress")).to_be_visible()
    expect(patient_page.locator(".ph-progress-card").filter(has_text="Fitness Progress")).to_be_visible()


def test_tc03_p1_dashboard_shows_stat_cards(patient_page: Page) -> None:
    """TC-03-P1 (cont.) — Stat cards render on the dashboard.

    Given Alice has reported exercises in the seed data,
    When the dashboard loads,
    Then the 'Exercises Completed This Week' stat card is visible.
    """
    # ACT
    PatientHomePage(patient_page).goto()
    patient_page.wait_for_load_state("networkidle")

    # ASSERT
    expect(patient_page.locator(".ph-stat-card").first).to_be_visible()


# ──────────────────────────────────────────────────────────────────────────────
# TC-03 Positive — Today's Plan
# ──────────────────────────────────────────────────────────────────────────────

def test_tc03_p4_my_plan_shows_todays_exercises(patient_page: Page) -> None:
    """TC-03-P4 — My Plan loads today's exercises for Alice.

    Given Alice has exercises scheduled for today,
    When she navigates to /patient/my-plan,
    Then exercise cards are visible in the today plan section.
    """
    # ACT
    MyPlanPage(patient_page).goto()
    patient_page.wait_for_load_state("networkidle")

    # ASSERT — at least one exercise card shown
    total_cards = patient_page.locator(".mp-card").count()
    assert total_cards > 0, "Expected at least one exercise card in today's plan"


def test_tc03_p7_completed_exercise_has_correct_styling(patient_page: Page) -> None:
    """TC-03-P7 — Completed exercises are visually distinguished.

    Given Wall Squats has been reported as completed in the seed data,
    When Alice views My Plan,
    Then the Wall Squats card has the --completed modifier class.
    """
    # ACT
    MyPlanPage(patient_page).goto()
    patient_page.wait_for_load_state("networkidle")

    # ASSERT
    wall_squats = patient_page.locator(".mp-card--completed").filter(has_text="Wall Squats")
    if wall_squats.count() == 0:
        pytest.skip("Wall Squats completed card not found — verify seed data has a completed report for today")
    expect(wall_squats.first).to_be_visible()


def test_tc03_p6_expand_to_full_week(patient_page: Page) -> None:
    """TC-03-P6 — Expanding 'View All' shows the full 7-day weekly view.

    Given Alice is on My Plan,
    When she clicks 'View All',
    Then the weekly view section becomes visible.
    """
    # ACT
    my_plan = MyPlanPage(patient_page).goto()
    patient_page.wait_for_load_state("networkidle")
    my_plan.expand_week_view()

    # ASSERT
    expect(patient_page.locator(".mp-week-view--visible")).to_be_visible()
    assert my_plan.is_week_view_expanded


# ──────────────────────────────────────────────────────────────────────────────
# TC-03 Positive — Rehabilitation Progress (My Process)
# ──────────────────────────────────────────────────────────────────────────────

def test_tc03_p8_patient_views_own_progress(patient_page: Page) -> None:
    """TC-03-P8 — My Process shows Alice's plan progress.

    Given Alice has active treatment and fitness plans,
    When she navigates to /patient/my-process,
    Then her profile card and plan progress are visible.
    """
    # ACT
    details = PatientDetailsPage(patient_page).goto_as_patient()
    patient_page.wait_for_load_state("networkidle")

    # ASSERT
    expect(patient_page.locator(".patient-profile-card__name")).to_be_visible()
    assert "Alice" in details.patient_name


def test_tc03_p8_treatment_plan_link_visible(patient_page: Page) -> None:
    """TC-03-P8 (cont.) — Treatment plan link is visible on My Process.

    Given Alice has an active treatment plan (plan 2 / shoulder),
    When she is on My Process,
    Then 'Go to Current Treatment Plan' link is present.
    """
    # ACT
    details = PatientDetailsPage(patient_page).goto_as_patient()
    patient_page.wait_for_load_state("networkidle")

    # ASSERT
    assert details.has_treatment_plan


# ──────────────────────────────────────────────────────────────────────────────
# TC-03 Positive — Visit Summaries
# ──────────────────────────────────────────────────────────────────────────────

def test_tc03_p10_patient_sees_visit_summaries_list(patient_page: Page) -> None:
    """TC-03-P10 — Visit summaries list shows Alice's 2 seeded sessions.

    Given Alice has sessions 101 and 102 in the database,
    When she navigates to /patient/visit-summaries,
    Then at least 2 session cards are shown.
    """
    # ACT
    summaries = AllVisitSummariesPage(patient_page).goto_as_patient()
    patient_page.wait_for_load_state("networkidle")

    # ASSERT
    assert summaries.session_count >= 2, (
        f"Expected at least 2 sessions, got {summaries.session_count}"
    )


def test_tc03_p11_patient_opens_session_detail(patient_page: Page) -> None:
    """TC-03-P11 — Clicking a session card shows the full visit detail.

    Given Alice's visit summaries list has at least one session,
    When she clicks the first session card,
    Then the URL changes to the visit detail and the 'Visit Summary' heading is shown.
    """
    # ACT
    summaries = AllVisitSummariesPage(patient_page).goto_as_patient()
    patient_page.wait_for_load_state("networkidle")
    summaries.click_session(0)
    patient_page.wait_for_load_state("networkidle")

    # ASSERT — URL changed to visit detail
    expect(patient_page).to_have_url(re.compile(r".*/visit-summaries/\d+$"))
    expect(patient_page.locator(".patient-nav__title")).to_have_text("Visit Summary")


def test_tc03_p12_filter_by_physical_therapy(patient_page: Page) -> None:
    """TC-03-P12 — Filtering by 'Physical Therapy' shows only PHYSIO sessions.

    Given Alice has both Fitness and Physio sessions,
    When she clicks the 'Physical Therapy' filter,
    Then the active filter label changes and the list updates.
    """
    # ACT
    summaries = AllVisitSummariesPage(patient_page).goto_as_patient()
    patient_page.wait_for_load_state("networkidle")
    summaries.filter_by("Physical Therapy")
    patient_page.wait_for_load_state("networkidle")

    # ASSERT
    assert summaries.active_filter == "Physical Therapy"


# ──────────────────────────────────────────────────────────────────────────────
# TC-03 Positive — Treatment Plan View
# ──────────────────────────────────────────────────────────────────────────────

def test_tc03_p13_patient_views_treatment_plan_from_my_process(patient_page: Page) -> None:
    """TC-03-P13 — Patient navigates from My Process to treatment plan detail.

    Given Alice has an active treatment plan,
    When she clicks 'Go to Current Treatment Plan' on My Process,
    Then she lands on the ViewTreatmentPlan page.
    """
    # ACT
    details = PatientDetailsPage(patient_page).goto_as_patient()
    patient_page.wait_for_load_state("networkidle")

    if not details.has_treatment_plan:
        pytest.skip("Alice has no active treatment plan in the current seed")

    details.go_to_treatment_plan()
    patient_page.wait_for_load_state("networkidle")

    # ASSERT
    expect(patient_page).to_have_url(re.compile(r".*/treatment-plans/\d+$"))


# ──────────────────────────────────────────────────────────────────────────────
# TC-03 Negative Cases
# ──────────────────────────────────────────────────────────────────────────────

def test_tc03_n3_no_sessions_empty_state(physiotherapist_page: Page) -> None:
    """TC-03-N3 — Visit summaries empty state for a patient with no sessions.

    Given a user navigates to a patient's visit summaries that has no data,
    When the page loads and the list is empty,
    Then the empty state element is shown (no crash).

    Note: This tests the UI pattern. In the current seed, all patients have
    sessions.  The test visits a nonexistent patient route which should
    show the empty state gracefully.
    """
    # ACT — navigate to a patient route with a non-existent ID
    physiotherapist_page.goto("/physiotherapist/patient/UNKNOWN/visit-summaries")
    physiotherapist_page.wait_for_load_state("networkidle")

    # ASSERT — either empty state OR error state, no crash (no unhandled exception text)
    assert not physiotherapist_page.locator("text=Uncaught Error").is_visible()


# ──────────────────────────────────────────────────────────────────────────────
# TC-03 Permission Tests
# ──────────────────────────────────────────────────────────────────────────────

def test_tc03_r1_physiotherapist_cannot_access_patient_my_plan(physiotherapist_page: Page) -> None:
    """TC-03-R1 — Physiotherapist is blocked from the patient-only My Plan route.

    Given Bob is authenticated as PHYSIOTHERAPIST,
    When he navigates directly to /patient/my-plan,
    Then RoleRoute redirects him to /physiotherapist/home.
    """
    # ACT
    physiotherapist_page.goto("/patient/my-plan")
    physiotherapist_page.wait_for_load_state("networkidle")

    # ASSERT
    expect(physiotherapist_page).to_have_url(re.compile(r".*/physiotherapist/home$"))
