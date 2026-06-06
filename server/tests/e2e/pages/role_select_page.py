"""Page object for the RoleSelect page at '/role-select'."""

from __future__ import annotations

from typing import Literal

from tests.e2e.pages.base_page import BasePage
from tests.e2e.pages.login_page import LoginPage
from tests.e2e.pages.signup_page import SignUpPage

Role = Literal["patient", "physiotherapist", "trainer"]

_ROLE_LABEL: dict[Role, str] = {
    "patient": "Patient",
    "physiotherapist": "Physiotherapist",
    "trainer": "Fitness Trainer",
}


class RoleSelectPage(BasePage):
    """Models the role-picker step shared by both login and sign-up flows."""

    def select_role(self, role: Role) -> LoginPage:
        """Click a role card during the login flow and wait for the login form.

        Args:
            role: One of 'patient', 'physiotherapist', or 'trainer'.

        Returns:
            A LoginPage pointing at the same browser page.
        """
        self._page.get_by_text(_ROLE_LABEL[role]).first.click()
        self._page.wait_for_url("**/login**")
        return LoginPage(self._page)

    def select_role_for_signup(self, role: Role) -> SignUpPage:
        """Click a role card during the sign-up flow and wait for the sign-up form.

        Args:
            role: One of 'patient', 'physiotherapist', or 'trainer'.

        Returns:
            A SignUpPage pointing at the same browser page.
        """
        self._page.get_by_text(_ROLE_LABEL[role]).first.click()
        self._page.wait_for_url("**/signup**")
        return SignUpPage(self._page)

    def select_patient(self) -> LoginPage:
        """Shortcut: select the Patient role.

        Returns:
            LoginPage.
        """
        return self.select_role("patient")

    def select_physiotherapist(self) -> LoginPage:
        """Shortcut: select the Physiotherapist role.

        Returns:
            LoginPage.
        """
        return self.select_role("physiotherapist")

    def select_trainer(self) -> LoginPage:
        """Shortcut: select the Fitness Trainer role.

        Returns:
            LoginPage.
        """
        return self.select_role("trainer")
