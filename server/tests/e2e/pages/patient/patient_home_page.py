"""Page object for the Patient Home dashboard at '/patient'."""

from __future__ import annotations

from playwright.sync_api import Locator

from tests.e2e.pages.base_page import BasePage
from tests.e2e.pages.top_nav import TopNav


class PatientHomePage(BasePage):
    """Models the patient dashboard: stats, progress cards, and today's exercises."""

    URL = "/patient"

    def __init__(self, page) -> None:
        super().__init__(page)
        self.nav = TopNav(page)

    def goto(self) -> PatientHomePage:
        """Navigate directly to the patient home.

        Returns:
            Self, for chaining.
        """
        self._page.goto(self.URL)
        return self

    # ------------------------------------------------------------------
    # Actions
    # ------------------------------------------------------------------

    def click_all_exercises(self) -> None:
        """Click the 'All Exercises' button to go to My Plan."""
        self._page.get_by_role("button", name="All Exercises").click()

    def click_exercise(self, name: str) -> None:
        """Click an exercise item in today's list by its display name.

        Args:
            name: Visible exercise name text.
        """
        self._page.locator(".ph-exercise-item").filter(has_text=name).click()

    # ------------------------------------------------------------------
    # Readable state
    # ------------------------------------------------------------------

    @property
    def greeting(self) -> str:
        """Return the greeting H1 text ('Hello, {first_name}').

        Returns:
            Greeting text.
        """
        return self._page.locator(".ph-greeting").inner_text()

    @property
    def exercise_items(self) -> Locator:
        """Return the locator for all exercise items in today's list.

        Returns:
            Locator for .ph-exercise-item elements.
        """
        return self._page.locator(".ph-exercise-item")

    @property
    def is_empty_today(self) -> bool:
        """Return True when the 'No exercises today' empty state is shown.

        Returns:
            True if the empty state is visible.
        """
        return self._page.locator(".ph-exercise-empty").is_visible()

    @property
    def is_loaded(self) -> bool:
        """Return True once the loading spinner is gone and content is visible.

        Returns:
            True if the page content is rendered.
        """
        return not self._page.locator(".ph-loading").is_visible()
