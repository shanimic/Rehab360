"""Page object for the Professional Home dashboard.

Routes: /physiotherapist/home, /fitness/home
"""

from __future__ import annotations

from playwright.sync_api import Locator

from tests.e2e.pages.base_page import BasePage
from tests.e2e.pages.top_nav import TopNav


class ProfessionalHomePage(BasePage):
    """Models the professional dashboard: patient roster, alerts, and visit CTA."""

    PHYSIO_URL = "/physiotherapist/home"
    FITNESS_URL = "/fitness/home"

    def __init__(self, page) -> None:
        super().__init__(page)
        self.nav = TopNav(page)

    def goto_as_physiotherapist(self) -> ProfessionalHomePage:
        """Navigate to the physiotherapist home dashboard.

        Returns:
            Self, for chaining.
        """
        self._page.goto(self.PHYSIO_URL)
        return self

    def goto_as_trainer(self) -> ProfessionalHomePage:
        """Navigate to the fitness trainer home dashboard.

        Returns:
            Self, for chaining.
        """
        self._page.goto(self.FITNESS_URL)
        return self

    # ------------------------------------------------------------------
    # Actions
    # ------------------------------------------------------------------

    def click_new_visit_summary(self) -> None:
        """Open the Select Patient modal by clicking 'New Visit Summary'."""
        self._page.get_by_role("button", name="New Visit Summary").click()

    def select_patient_from_modal(self, patient_name: str) -> None:
        """Choose a patient inside the Select Patient modal.

        Args:
            patient_name: Full or partial patient name to match.
        """
        # Modal opens after click_new_visit_summary()
        search = self._page.get_by_placeholder("Search by name or ID...")
        search.fill(patient_name)
        self._page.get_by_text(patient_name).first.click()

    def close_patient_modal(self) -> None:
        """Close the Select Patient modal without choosing."""
        self._page.get_by_role("button", name="Close").click()

    def click_patient_card(self, patient_name: str) -> None:
        """Click a patient card in the roster to open Patient Details.

        Args:
            patient_name: Visible patient name on the card.
        """
        self._page.get_by_text(patient_name).first.click()

    def search_patients(self, query: str) -> None:
        """Type into the patient search field.

        Args:
            query: Name to filter by.
        """
        self._page.get_by_placeholder("Search by patient name...").fill(query)

    # ------------------------------------------------------------------
    # Readable state
    # ------------------------------------------------------------------

    @property
    def patient_cards(self) -> Locator:
        """Return the locator for all patient cards in the roster.

        Returns:
            Locator for patient card elements.
        """
        return self._page.locator(".patients-carousel__card, [class*='patient-card']")

    @property
    def patient_count_text(self) -> str:
        """Return the patient count label (e.g. '5 patients').

        Returns:
            Count label text.
        """
        return self._page.get_by_text("patients").inner_text()

    @property
    def is_patient_modal_open(self) -> bool:
        """Return True when the Select Patient modal is visible.

        Returns:
            True if the modal heading 'Select Patient' is visible.
        """
        return self._page.get_by_role("heading", name="Select Patient").is_visible()

    @property
    def no_results_visible(self) -> bool:
        """Return True when the 'No results found' message is shown.

        Returns:
            True if empty-search state is visible.
        """
        return self._page.get_by_text("No results found").is_visible()
