"""Page-object component for the shared TopNav sidebar."""

from __future__ import annotations

from playwright.sync_api import Page


class TopNav:
    """Models the TopNav hamburger menu present on every authenticated page.

    Args:
        page: The Playwright Page instance.
    """

    def __init__(self, page: Page) -> None:
        self._page = page

    # ------------------------------------------------------------------
    # Menu open / close
    # ------------------------------------------------------------------

    def open(self) -> None:
        """Open the slide-out navigation drawer."""
        self._page.get_by_role("button", name="Open navigation menu").click()

    def close(self) -> None:
        """Close the slide-out navigation drawer."""
        self._page.get_by_role("button", name="Close menu").click()

    # ------------------------------------------------------------------
    # Navigation actions (open menu first if needed)
    # ------------------------------------------------------------------

    def go_to_home(self) -> None:
        """Click the Home nav item (opens menu automatically)."""
        self.open()
        self._page.get_by_role("button", name="Home").click()

    def go_to_my_plan(self) -> None:
        """Navigate to /patient/my-plan (patient only)."""
        self.open()
        self._page.get_by_role("button", name="My Plan").click()

    def go_to_my_process(self) -> None:
        """Navigate to /patient/my-process (patient only)."""
        self.open()
        self._page.get_by_role("button", name="My Process").click()

    def go_to_ai_search(self) -> None:
        """Navigate to /ai-search (all roles)."""
        self.open()
        self._page.get_by_role("button", name="AI Search").click()

    def go_to_saved_content(self) -> None:
        """Navigate to /ai-search/saved (all roles)."""
        self.open()
        self._page.get_by_role("button", name="Saved Content").click()

    def go_to_profile(self) -> None:
        """Navigate to /profile (all roles)."""
        self.open()
        self._page.get_by_role("button", name="My Profile").click()

    def logout(self) -> None:
        """Click Logout; clears authAtom and returns to landing page."""
        self.open()
        self._page.get_by_role("button", name="Logout").click()

    # ------------------------------------------------------------------
    # Readable state
    # ------------------------------------------------------------------

    @property
    def user_name(self) -> str:
        """Return the display name shown in the nav header."""
        return self._page.locator(".top-nav__doctor").inner_text()
