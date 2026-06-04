"""Page object for the Create Treatment/Fitness Plan form."""

from __future__ import annotations

from playwright.sync_api import Locator

from tests.e2e.pages.base_page import BasePage
from tests.e2e.pages.top_nav import TopNav


class CreateTreatmentPlanPage(BasePage):
    """Models the treatment/fitness plan builder form.

    Routes:
        /physiotherapist/patient/:patientId/treatment-plans/new/:sessionId
        /fitness/patient/:patientId/fitness-plans/new/:sessionId
    """

    def __init__(self, page) -> None:
        super().__init__(page)
        self.nav = TopNav(page)

    # ------------------------------------------------------------------
    # Actions — plan fields
    # ------------------------------------------------------------------

    def fill_goal(self, text: str) -> CreateTreatmentPlanPage:
        """Fill the mandatory goal textarea.

        Args:
            text: Treatment or fitness goal.

        Returns:
            Self, for chaining.
        """
        self._page.locator("#ctp-goal").fill(text)
        return self

    def fill_start_date(self, date: str) -> CreateTreatmentPlanPage:
        """Set the plan start date.

        Args:
            date: Date string (e.g. '2026-06-04').

        Returns:
            Self, for chaining.
        """
        self._page.locator("#ctp-start-date").fill(date)
        return self

    def fill_end_date(self, date: str) -> CreateTreatmentPlanPage:
        """Set the plan end date (must be after start date).

        Args:
            date: Date string (e.g. '2026-09-04').

        Returns:
            Self, for chaining.
        """
        self._page.locator("#ctp-end-date").fill(date)
        return self

    def fill_notes(self, text: str) -> CreateTreatmentPlanPage:
        """Fill the optional general notes textarea.

        Args:
            text: Clinical notes / contraindications.

        Returns:
            Self, for chaining.
        """
        self._page.locator("#ctp-notes").fill(text)
        return self

    # ------------------------------------------------------------------
    # Actions — exercise modal
    # ------------------------------------------------------------------

    def open_add_exercise_modal(self) -> CreateTreatmentPlanPage:
        """Click 'Add Exercise' to open the exercise selector modal.

        Returns:
            Self, for chaining.
        """
        self._page.get_by_role("button", name="Add Exercise").click()
        return self

    def search_exercise(self, name: str) -> CreateTreatmentPlanPage:
        """Type in the exercise search field inside the modal.

        Args:
            name: Exercise name or partial name to search.

        Returns:
            Self, for chaining.
        """
        self._page.get_by_placeholder("Search exercise…").fill(name)
        return self

    def select_exercise_from_dropdown(self, name: str) -> CreateTreatmentPlanPage:
        """Click an exercise option in the search dropdown.

        Args:
            name: Exact display name of the exercise.

        Returns:
            Self, for chaining.
        """
        self._page.locator(".aem-dropdown__item").filter(has_text=name).click()
        return self

    def fill_exercise_sets(self, value: int) -> CreateTreatmentPlanPage:
        """Set the number of sets for the exercise being added.

        Args:
            value: Number of sets.

        Returns:
            Self, for chaining.
        """
        self._page.get_by_label("Sets *").fill(str(value))
        return self

    def fill_exercise_reps(self, value: int) -> CreateTreatmentPlanPage:
        """Set the number of reps for the exercise being added.

        Args:
            value: Number of reps.

        Returns:
            Self, for chaining.
        """
        self._page.get_by_label("Reps *").fill(str(value))
        return self

    def confirm_add_exercise(self) -> CreateTreatmentPlanPage:
        """Click 'Add Exercise' inside the modal to confirm.

        Returns:
            Self, for chaining.
        """
        self._page.locator(".aem-btn-add").click()
        return self

    def close_exercise_modal(self) -> CreateTreatmentPlanPage:
        """Click Cancel or the close button to dismiss the exercise modal.

        Returns:
            Self, for chaining.
        """
        self._page.get_by_role("button", name="Close").click()
        return self

    def add_exercise(
        self,
        name: str,
        sets: int = 3,
        reps: int = 12,
    ) -> CreateTreatmentPlanPage:
        """Convenience: open modal, pick exercise, set sets/reps, confirm.

        Args:
            name: Exercise name to search and select.
            sets: Number of sets (default 3).
            reps: Number of reps (default 12).

        Returns:
            Self, for chaining.
        """
        (
            self.open_add_exercise_modal()
            .search_exercise(name)
            .select_exercise_from_dropdown(name)
            .fill_exercise_sets(sets)
            .fill_exercise_reps(reps)
            .confirm_add_exercise()
        )
        return self

    def remove_exercise(self, name: str) -> CreateTreatmentPlanPage:
        """Click the remove button on a specific exercise card.

        Args:
            name: Exercise display name.

        Returns:
            Self, for chaining.
        """
        self._page.get_by_role("button", name=f"Remove {name}").click()
        return self

    def save_plan(self) -> None:
        """Click 'Save Treatment Plan' or 'Save Fitness Plan' to submit."""
        self._page.locator(".ctp-btn-save").click()

    def go_back(self) -> None:
        """Click the back arrow in the page header."""
        self._page.locator(".patient-nav__back").click()

    # ------------------------------------------------------------------
    # Readable state
    # ------------------------------------------------------------------

    @property
    def exercise_cards(self) -> Locator:
        """Return the locator for all exercise cards added to the plan.

        Returns:
            Locator for .ctp-exercise-card elements.
        """
        return self._page.locator(".ctp-exercise-card")

    @property
    def exercise_count(self) -> int:
        """Return the number of exercises currently in the plan.

        Returns:
            Integer count.
        """
        return self.exercise_cards.count()

    @property
    def is_exercise_modal_open(self) -> bool:
        """Return True when the Add Exercise modal overlay is visible.

        Returns:
            True if .aem-overlay is visible.
        """
        return self._page.locator(".aem-overlay").is_visible()

    @property
    def is_saving(self) -> bool:
        """Return True while the save request is in-flight.

        Returns:
            True if the saving state text is visible.
        """
        return self._page.get_by_text("Saving…").is_visible()
