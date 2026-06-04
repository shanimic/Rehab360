"""TC-06, TC-07, TC-08: AI Medical Knowledge Search and Saved Content.

TC-06: AI search idle/results UI and follow-up.
TC-07: Saving and removing medical content.
TC-08: Professional verification of saved content.

IMPORTANT: Tests marked with [slow] make real calls to the Google Gemini API.
           They require a running backend with a valid GEMINI_API_KEY in .env.
           Run with: pytest tests/e2e/test_tc06_ai_search.py -v
"""

import re

import pytest
from playwright.sync_api import Page, expect

from tests.e2e.pages import AiSearchPage, SavedContentPage


# ──────────────────────────────────────────────────────────────────────────────
# TC-06 — Positive: UI state tests (no API call)
# ──────────────────────────────────────────────────────────────────────────────

def test_tc06_idle_state_renders(patient_page: Page) -> None:
    """TC-06 — AI Search idle state shows headline and topic chips.

    Given Alice is authenticated,
    When she navigates to /ai-search,
    Then the page title and topic chips are visible.
    """
    # ACT
    ai = AiSearchPage(patient_page).goto()
    patient_page.wait_for_load_state("networkidle")

    # ASSERT
    expect(patient_page.locator(".ais-page__headline")).to_have_text("AI Search")
    assert ai.is_idle
    expect(patient_page.get_by_role("button", name="Post-surgery pain")).to_be_visible()


def test_tc06_p3_chip_prefills_query(patient_page: Page) -> None:
    """TC-06-P3 — Clicking a topic chip pre-fills the search textarea.

    Given Alice is on the AI Search page,
    When she clicks the 'Range of motion' chip,
    Then the textarea is populated with that text.
    """
    # ACT
    ai = AiSearchPage(patient_page).goto()
    patient_page.wait_for_load_state("networkidle")
    ai.click_chip("Range of motion")

    # ASSERT — textarea has the chip text
    textarea = patient_page.get_by_placeholder("Ask about your recovery, exercises, or diagnosis…")
    expect(textarea).to_have_value(re.compile(r"Range of motion", re.IGNORECASE))


def test_tc06_r1_unauthenticated_redirected_from_ai_search(page: Page) -> None:
    """TC-06-R1 — Unauthenticated user is blocked from /ai-search.

    Given no auth state,
    When the user navigates to /ai-search,
    Then RoleRoute redirects to the landing page ('/').
    """
    # ACT
    page.goto("/ai-search")
    page.wait_for_load_state("networkidle")

    # ASSERT
    expect(page).not_to_have_url("**/ai-search**")
    expect(page).to_have_url(re.compile(r".*/$"))


def test_tc06_r2_patient_can_access_ai_search(patient_page: Page) -> None:
    """TC-06-R2 — Patient role is allowed to use AI Search.

    Given Alice is authenticated as PATIENT,
    When she navigates to /ai-search,
    Then the page loads successfully (headline visible).
    """
    # ACT
    patient_page.goto("/ai-search")
    patient_page.wait_for_load_state("networkidle")

    # ASSERT
    expect(patient_page.locator(".ais-page__headline")).to_be_visible()


# ──────────────────────────────────────────────────────────────────────────────
# TC-06 — Positive: real Gemini API calls  [slow]
# ──────────────────────────────────────────────────────────────────────────────

def test_tc06_p1_basic_query_returns_summary(patient_page: Page) -> None:
    """TC-06-P1 — Basic query returns a summary and sources from Gemini.

    SLOW — makes a real Gemini API call (~10–30s).

    Given Alice submits a rehabilitation query,
    When the response arrives,
    Then the results container is visible and the 'New Chat' button appears.
    """
    # ACT
    ai = AiSearchPage(patient_page).goto()
    patient_page.wait_for_load_state("networkidle")
    ai.search("What exercises help with knee rehabilitation?")

    # Wait up to 60s for the API response
    patient_page.wait_for_selector(".ais-page__results-container", timeout=60_000)

    # ASSERT
    assert ai.has_results
    expect(patient_page.locator(".ais-page__new-chat-btn")).to_be_visible()


def test_tc06_p4_new_chat_resets_conversation(patient_page: Page) -> None:
    """TC-06-P4 — 'New Chat' clears the conversation and restores idle state.

    SLOW — requires a prior search result.

    Given a search has been performed,
    When 'New Chat' is clicked,
    Then the idle state (chips/disclaimer) is restored.
    """
    # PREPARE — run a search first
    ai = AiSearchPage(patient_page).goto()
    patient_page.wait_for_load_state("networkidle")
    ai.search("How can I reduce swelling?")
    patient_page.wait_for_selector(".ais-page__results-container", timeout=60_000)

    # ACT
    ai.click_new_chat()
    patient_page.wait_for_timeout(500)

    # ASSERT — back to idle
    assert ai.is_idle


def test_tc06_n1_empty_query_blocked(patient_page: Page) -> None:
    """TC-06-N1 — Ask button is disabled when the query textarea is empty.

    Given the search textarea is empty,
    When the page loads,
    Then the Ask button is disabled so no request can be sent.
    """
    # ACT
    AiSearchPage(patient_page).goto()
    patient_page.wait_for_load_state("networkidle")

    # ASSERT — Ask button disabled when textarea is empty
    ask_btn = patient_page.get_by_role("button", name="Ask")
    assert ask_btn.is_disabled(), "Expected Ask button to be disabled when textarea is empty"


# ──────────────────────────────────────────────────────────────────────────────
# TC-07 / TC-08 — Saving and verifying content  [slow, depends on search result]
# ──────────────────────────────────────────────────────────────────────────────

def test_tc07_p1_patient_saves_a_source(patient_page: Page) -> None:
    """TC-07-P1 — Patient can save a source card from search results.

    SLOW — requires a real Gemini response with at least one source.

    Given a search returns sources,
    When Alice clicks the Save button on the first source,
    Then the button state changes to 'Saved'.
    """
    # PREPARE — search for something that reliably returns sources
    ai = AiSearchPage(patient_page).goto()
    patient_page.wait_for_load_state("networkidle")
    ai.search("RICE method for acute injuries")
    patient_page.wait_for_selector(".ais-page__results-container", timeout=60_000)

    # Wait for source articles to appear
    patient_page.wait_for_selector("article", timeout=10_000)

    # ACT — click Save on the first source article
    first_article = patient_page.locator("article").first
    save_btn = first_article.get_by_role("button", name=re.compile(r"Save|Saved", re.I))
    save_btn.click()
    patient_page.wait_for_timeout(1000)

    # ASSERT — button label changes to Saved
    expect(save_btn).to_have_accessible_name(re.compile(r"Saved", re.I))


def test_tc07_n2_patient_cannot_see_verify_button(patient_page: Page) -> None:
    """TC-07-N2 — Verify button is not visible for patient role.

    SLOW — requires a real Gemini response.

    Given Alice (PATIENT) views search results with source cards,
    When the results load,
    Then no 'Verify' button is visible.
    """
    # PREPARE
    ai = AiSearchPage(patient_page).goto()
    patient_page.wait_for_load_state("networkidle")
    ai.search("Shoulder rotator cuff exercises")
    patient_page.wait_for_selector(".ais-page__results-container", timeout=60_000)

    # ASSERT
    verify_btn = patient_page.get_by_role("button", name="Verify")
    assert verify_btn.count() == 0, "Verify button should not be visible for patient role"


def test_tc08_r1_patient_cannot_verify_saved_content(patient_page: Page) -> None:
    """TC-08-R1 — Patient sees no Verify button on the Saved Content page.

    Given Alice navigates to /ai-search/saved,
    When the page loads (Alice has one saved item from seed),
    Then no Verify button is shown.
    """
    # ACT
    saved = SavedContentPage(patient_page).goto()
    patient_page.wait_for_load_state("networkidle")

    # ASSERT
    assert not saved.verify_button_visible


def test_tc08_r1_professional_sees_verify_button_on_saved_content(physiotherapist_page: Page) -> None:
    """TC-08-R1 (cont.) — Physiotherapist sees Verify button on Saved Content.

    Given Bob (PHYSIOTHERAPIST) has saved content (from seed),
    When he navigates to /ai-search/saved,
    Then the Verify button is visible.
    """
    # ACT
    saved = SavedContentPage(physiotherapist_page).goto()
    physiotherapist_page.wait_for_load_state("networkidle")

    if saved.item_count == 0:
        pytest.skip("Bob has no saved content in current seed")

    # ASSERT
    assert saved.verify_button_visible
