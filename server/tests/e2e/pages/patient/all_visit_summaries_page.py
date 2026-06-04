"""Page object for the All Visit Summaries list page."""

from __future__ import annotations

from typing import Literal

from playwright.sync_api import Locator

from tests.e2e.pages.base_page import BasePage
from tests.e2e.pages.top_nav import TopNav

FilterTab = Literal["All Sessions", "Physical Therapy", "Training"]


class AllVisitSummariesPage(BasePage):
    """Models the session list view accessible to both patients and professionals."""

    PATIENT_URL = "/patient/visit-summaries"

    def __init__(self, page) -> None:
        super().__init__(page)
        self.nav = TopNav(page)

    def goto_as_patient(self) -> AllVisitSummariesPage:
        """Navigate to the patient's own visit summaries list.

        Returns:
            Self, for chaining.
        """
        self._page.goto(self.PATIENT_URL)
        return self

    def goto_as_professional(self, patient_id: str, role: str = "physiotherapist") -> AllVisitSummariesPage:
        """Navigate to a patient's visit summaries as a professional.

        Args:
            patient_id: Patient ID string.
            role: 'physiotherapist' or 'fitness'.

        Returns:
            Self, for chaining.
        """
        self._page.goto(f"/{role}/patient/{patient_id}/visit-summaries")
        return self

    # ------------------------------------------------------------------
    # Actions
    # ------------------------------------------------------------------

    def filter_by(self, tab: FilterTab) -> AllVisitSummariesPage:
        """Click a filter tab to narrow the session list.

        Args:
            tab: One of 'All Sessions', 'Physical Therapy', or 'Training'.

        Returns:
            Self, for chaining.
        """
        self._page.get_by_text(tab).click()
        return self

    def click_session(self, index: int = 0) -> None:
        """Click a session card by its position in the list (0-based).

        Args:
            index: Zero-based index into the visible session cards.
        """
        self._page.locator(".avs-visit-card").nth(index).click()

    def click_new_summary(self) -> None:
        """Click 'New Summary' (staff only) to start a new visit summary."""
        self._page.get_by_role("button", name="New Summary").click()

    def go_back(self) -> None:
        """Click the back arrow in the page header."""
        self._page.locator(".patient-nav__back").click()

    # ------------------------------------------------------------------
    # Readable state
    # ------------------------------------------------------------------

    @property
    def session_cards(self) -> Locator:
        """Return the locator for all visible session cards.

        Returns:
            Locator for .avs-visit-card elements.
        """
        return self._page.locator(".avs-visit-card")

    @property
    def session_count(self) -> int:
        """Return the number of session cards currently visible.

        Returns:
            Integer count.
        """
        return self.session_cards.count()

    @property
    def is_empty(self) -> bool:
        """Return True when the 'No sessions found' empty state is shown.

        Returns:
            True if the empty state is visible.
        """
        return self._page.locator(".avs-empty").is_visible()

    @property
    def active_filter(self) -> str:
        """Return the label of the currently active filter tab.

        Returns:
            Active tab label text.
        """
        return self._page.locator(".avs-filter-tab--active").inner_text()
