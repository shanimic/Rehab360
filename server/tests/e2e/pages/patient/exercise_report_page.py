"""Page object for the Exercise Report page at '/patient/exercise/:id'."""

from __future__ import annotations

from tests.e2e.pages.base_page import BasePage
from tests.e2e.pages.top_nav import TopNav


class ExerciseReportPage(BasePage):
    """Models the exercise reporting form.

    Notes:
        This page requires React Router location state.  Navigate to it by
        clicking an exercise in MyPlanPage rather than calling goto() directly.
        A direct goto() will show the empty state.
    """

    def __init__(self, page) -> None:
        super().__init__(page)
        self.nav = TopNav(page)

    # ------------------------------------------------------------------
    # Actions — completion branch
    # ------------------------------------------------------------------

    def click_completed(self) -> ExerciseReportPage:
        """Select the 'Completed' outcome button.

        Returns:
            Self, for chaining.
        """
        self._page.get_by_role("button", name="Completed").click()
        return self

    def click_not_completed(self) -> ExerciseReportPage:
        """Select the 'Not Completed' outcome button.

        Returns:
            Self, for chaining.
        """
        self._page.get_by_role("button", name="Not Completed").click()
        return self

    def set_pain(self, value: int) -> ExerciseReportPage:
        """Set the pain level to *value* (0–10) via the +/- buttons.

        Resets to 0 first then increments to avoid stale state.

        Args:
            value: Target pain level between 0 and 10.

        Returns:
            Self, for chaining.
        """
        self._set_rating("Pain", value)
        return self

    def set_effort(self, value: int) -> ExerciseReportPage:
        """Set the effort level to *value* (0–10) via the +/- buttons.

        Args:
            value: Target effort level between 0 and 10.

        Returns:
            Self, for chaining.
        """
        self._set_rating("Effort", value)
        return self

    def fill_change_request(self, text: str) -> ExerciseReportPage:
        """Fill the optional change requests textarea.

        Args:
            text: Free-text change request.

        Returns:
            Self, for chaining.
        """
        self._page.locator("#change-request").fill(text)
        return self

    def fill_not_completed_reason(self, text: str) -> ExerciseReportPage:
        """Fill the mandatory non-completion reason textarea.

        Args:
            text: Reason for not completing the exercise.

        Returns:
            Self, for chaining.
        """
        self._page.locator("#not-completed").fill(text)
        return self

    def submit(self) -> None:
        """Click the 'Save' button to submit the report."""
        self._page.get_by_role("button", name="Save").click()

    def go_back(self) -> None:
        """Click the back arrow (triggers leave-modal if form is dirty)."""
        self._page.get_by_role("button", name="Go back").click()

    # ------------------------------------------------------------------
    # Leave-modal actions
    # ------------------------------------------------------------------

    def confirm_leave(self) -> None:
        """Confirm leaving without saving in the unsaved-changes dialog."""
        self._page.locator(".er-leave-modal__leave").click()

    def cancel_leave(self) -> None:
        """Stay on the page when the unsaved-changes dialog appears."""
        self._page.locator(".er-leave-modal__stay").click()

    # ------------------------------------------------------------------
    # Readable state
    # ------------------------------------------------------------------

    @property
    def exercise_name(self) -> str:
        """Return the display name of the exercise being reported.

        Returns:
            Exercise name string.
        """
        return self._page.locator(".er-page-title__name").inner_text()

    @property
    def is_empty_state(self) -> bool:
        """Return True when the 'No exercise data found' empty state is shown.

        Returns:
            True if the empty state is visible.
        """
        return self._page.locator(".er-page--empty").is_visible()

    @property
    def is_save_disabled(self) -> bool:
        """Return True when the Save button is disabled.

        Returns:
            True if the Save button is disabled.
        """
        return self._page.get_by_role("button", name="Save").is_disabled()

    @property
    def pain_value(self) -> int:
        """Return the current pain rating displayed.

        Returns:
            Integer pain level.
        """
        values = self._page.locator(".er-rating__value").all_inner_texts()
        return int(values[0]) if values else 0

    @property
    def effort_value(self) -> int:
        """Return the current effort rating displayed.

        Returns:
            Integer effort level.
        """
        values = self._page.locator(".er-rating__value").all_inner_texts()
        return int(values[1]) if len(values) > 1 else 0

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _set_rating(self, label: str, target: int) -> None:
        """Drive a rating widget to a specific value by clicking +/- buttons.

        Args:
            label: 'Pain' or 'Effort'.
            target: Desired value 0–10.
        """
        decrease = self._page.get_by_role("button", name=f"Decrease {label}")
        increase = self._page.get_by_role("button", name=f"Increase {label}")
        # Reset to 0
        for _ in range(10):
            decrease.click()
        # Increment to target
        for _ in range(target):
            increase.click()
