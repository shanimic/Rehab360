"""Page object for the My Plan page at '/patient/my-plan'."""

from __future__ import annotations

from playwright.sync_api import Locator

from tests.e2e.pages.base_page import BasePage
from tests.e2e.pages.top_nav import TopNav


class MyPlanPage(BasePage):
    """Models the weekly exercise plan view for patients."""

    URL = "/patient/my-plan"

    def __init__(self, page) -> None:
        super().__init__(page)
        self.nav = TopNav(page)

    def goto(self) -> MyPlanPage:
        """Navigate directly to My Plan.

        Returns:
            Self, for chaining.
        """
        self._page.goto(self.URL)
        return self

    # ------------------------------------------------------------------
    # Actions
    # ------------------------------------------------------------------

    def click_exercise(self, name: str) -> None:
        """Click a today-active exercise card by its display name.

        Args:
            name: Visible exercise name text on the card.
        """
        self._page.locator(".mp-card").filter(has_text=name).click()

    def expand_week_view(self) -> None:
        """Click 'View All' to expand the full 7-day weekly view."""
        btn = self._page.locator(".mp-section__view-all")
        if btn.get_attribute("aria-expanded") == "false":
            btn.click()

    def collapse_week_view(self) -> None:
        """Click 'Show Less' to collapse the weekly view."""
        btn = self._page.locator(".mp-section__view-all")
        if btn.get_attribute("aria-expanded") == "true":
            btn.click()

    def go_back(self) -> None:
        """Click the back arrow to return to patient home."""
        self._page.get_by_role("button", name="Back to home").click()

    def click_new_weekly_plan(self) -> None:
        """Click 'New Weekly Plan' to go to the schedule page."""
        self._page.get_by_role("button", name="New Weekly Plan").click()

    # ------------------------------------------------------------------
    # Readable state
    # ------------------------------------------------------------------

    @property
    def today_cards(self) -> Locator:
        """Return the locator for today's exercise cards.

        Returns:
            Locator for active (not completed, not tomorrow) .mp-card elements.
        """
        return self._page.locator(".mp-card:not(.mp-card--completed):not(.mp-card--tomorrow)")

    @property
    def completed_cards(self) -> Locator:
        """Return locator for completed exercise cards.

        Returns:
            Locator for .mp-card--completed elements.
        """
        return self._page.locator(".mp-card--completed")

    @property
    def subtitle(self) -> str:
        """Return the subtitle text showing remaining exercises count.

        Returns:
            Subtitle string.
        """
        return self._page.locator(".mp-title-sub").inner_text()

    @property
    def is_week_view_expanded(self) -> bool:
        """Return True when the weekly view is expanded.

        Returns:
            True if aria-expanded is 'true' on the View All button.
        """
        return self._page.locator(".mp-section__view-all").get_attribute("aria-expanded") == "true"
