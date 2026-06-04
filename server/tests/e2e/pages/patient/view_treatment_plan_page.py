"""Page object for the View Treatment/Fitness Plan page."""

from __future__ import annotations

from playwright.sync_api import Locator

from tests.e2e.pages.base_page import BasePage
from tests.e2e.pages.top_nav import TopNav


class ViewTreatmentPlanPage(BasePage):
    """Models the read-only plan detail view shared by patients and professionals.

    Routes:
        /patient/treatment-plans/:planId
        /patient/fitness-plans/:planId
        /physiotherapist/patient/:patientId/treatment-plans/:planId
        /fitness/patient/:patientId/fitness-plans/:planId
    """

    def __init__(self, page) -> None:
        super().__init__(page)
        self.nav = TopNav(page)

    def go_back(self) -> None:
        """Click the back arrow in the page header."""
        self._page.locator(".patient-nav__back").click()

    def expand_exercise(self, name: str) -> None:
        """Click an exercise row to expand its report history.

        Args:
            name: Visible exercise name text.
        """
        self._page.get_by_text(name).click()

    # ------------------------------------------------------------------
    # Readable state
    # ------------------------------------------------------------------

    @property
    def plan_goal(self) -> str:
        """Return the plan goal text.

        Returns:
            Goal text string.
        """
        return self._page.locator(".vtp-goal-text, .plan-goal").first.inner_text()

    @property
    def exercise_rows(self) -> Locator:
        """Return the locator for all exercise rows in the plan.

        Returns:
            Locator for exercise row elements.
        """
        return self._page.locator(".vtp-exercise-row, .plan-exercise-item").first.locator("..")

    @property
    def progress_percentage(self) -> str:
        """Return the progress percentage text shown on the plan.

        Returns:
            Progress string (e.g. '42%').
        """
        return self._page.locator(".vtp-progress-value, .progress-value").first.inner_text()
