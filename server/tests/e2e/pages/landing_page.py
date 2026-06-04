"""Page object for the LandingPage at '/'."""

from __future__ import annotations

from tests.e2e.pages.base_page import BasePage
from tests.e2e.pages.role_select_page import RoleSelectPage


class LandingPage(BasePage):
    """Models the public landing page with Log In / Sign Up CTAs."""

    URL = "/"

    def goto(self, path: str = "") -> LandingPage:
        """Navigate to the landing page.

        Args:
            path: Ignored; always navigates to the landing URL.

        Returns:
            Self, for chaining.
        """
        self._page.goto(self.URL)
        return self

    def click_login(self) -> RoleSelectPage:
        """Click the primary 'Log In' button and wait for role-select to load.

        Returns:
            A RoleSelectPage pointing at the same browser page.
        """
        self._page.get_by_role("button", name="Log In").click()
        self._page.wait_for_url("**/role-select**")
        return RoleSelectPage(self._page)

    def click_signup(self) -> RoleSelectPage:
        """Click the secondary 'Sign Up' button and wait for role-select to load.

        Returns:
            A RoleSelectPage pointing at the same browser page.
        """
        self._page.get_by_role("button", name="Sign Up").click()
        self._page.wait_for_url("**/role-select**")
        return RoleSelectPage(self._page)
