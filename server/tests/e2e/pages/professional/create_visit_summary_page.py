"""Page object for the Create Visit Summary form."""

from __future__ import annotations

from tests.e2e.pages.base_page import BasePage
from tests.e2e.pages.top_nav import TopNav


class CreateVisitSummaryPage(BasePage):
    """Models the new-visit-summary form for physiotherapists and fitness trainers.

    Routes:
        /physiotherapist/patient/:patientId/visit-summaries/new
        /fitness/patient/:patientId/visit-summaries/new
    """

    def __init__(self, page) -> None:
        super().__init__(page)
        self.nav = TopNav(page)

    # ------------------------------------------------------------------
    # Actions
    # ------------------------------------------------------------------

    def fill_date(self, date: str) -> CreateVisitSummaryPage:
        """Set the visit date.

        Args:
            date: Date string accepted by the date input (e.g. '2026-06-04').

        Returns:
            Self, for chaining.
        """
        self._page.locator("#cvs-date").fill(date)
        return self

    def fill_time(self, time: str) -> CreateVisitSummaryPage:
        """Set the visit time.

        Args:
            time: Time string (e.g. '10:30').

        Returns:
            Self, for chaining.
        """
        self._page.locator("#cvs-time").fill(time)
        return self

    def fill_treatment_area(self, text: str) -> CreateVisitSummaryPage:
        """Fill the Treatment Area field.

        Args:
            text: Treatment area description.

        Returns:
            Self, for chaining.
        """
        self._page.locator("#cvs-treatment-area").fill(text)
        return self

    def fill_diagnosis(self, text: str) -> CreateVisitSummaryPage:
        """Fill the Medical Diagnosis field (required).

        Args:
            text: Diagnosis text.

        Returns:
            Self, for chaining.
        """
        self._page.locator("#cvs-diagnosis").fill(text)
        return self

    def fill_visit_notes(self, text: str) -> CreateVisitSummaryPage:
        """Fill the Visit Notes textarea.

        Args:
            text: Clinical notes.

        Returns:
            Self, for chaining.
        """
        self._page.locator("#cvs-visit-notes").fill(text)
        return self

    def fill_recommendations(self, text: str) -> CreateVisitSummaryPage:
        """Fill the optional Recommendations textarea.

        Args:
            text: Recommendation text.

        Returns:
            Self, for chaining.
        """
        self._page.locator("#cvs-recommendations").fill(text)
        return self

    def save_and_create_plan(self) -> None:
        """Click 'Save & Create Treatment/Fitness Plan' to proceed to plan creation."""
        # Both physio and fitness variants share this class
        self._page.locator(".cvs-btn-plan").click()

    def save_summary_only(self) -> None:
        """Click 'Save Summary' without creating a new plan (requires previous plan)."""
        self._page.locator(".cvs-btn-save").click()

    def cancel(self) -> None:
        """Click 'Cancel' to discard and navigate back."""
        self._page.get_by_role("button", name="Cancel").click()

    def go_back(self) -> None:
        """Click the back arrow in the page header."""
        self._page.locator(".patient-nav__back").click()

    # ------------------------------------------------------------------
    # Readable state
    # ------------------------------------------------------------------

    @property
    def validation_errors(self) -> list[str]:
        """Return all visible field-level validation error messages.

        Returns:
            List of error strings (may be empty).
        """
        return self._page.locator(".cvs-error-msg").all_inner_texts()

    @property
    def session_type_badge(self) -> str:
        """Return the session type badge text ('Physical Therapy' or 'Fitness Training').

        Returns:
            Badge label text.
        """
        return self._page.locator(".cvs-session-badge").inner_text()

    @property
    def is_saving(self) -> bool:
        """Return True while the save request is in-flight.

        Returns:
            True if either save button shows 'Saving…'.
        """
        return self._page.get_by_text("Saving…").is_visible()
