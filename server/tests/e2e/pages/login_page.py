"""Page object for the Login page at '/login'."""

from __future__ import annotations

from tests.e2e.pages.base_page import BasePage


class LoginPage(BasePage):
    """Models the credential entry form.

    Supports both the happy path and negative / validation assertions.
    """

    # ------------------------------------------------------------------
    # Actions
    # ------------------------------------------------------------------

    def fill_email(self, email: str) -> LoginPage:
        """Type into the Email field.

        Args:
            email: Email address to enter.

        Returns:
            Self, for chaining.
        """
        self._page.get_by_label("Email").fill(email)
        return self

    def fill_password(self, password: str) -> LoginPage:
        """Type into the Password field.

        Args:
            password: Plaintext password to enter.

        Returns:
            Self, for chaining.
        """
        self._page.get_by_role("textbox", name="Password").fill(password)
        return self

    def submit(self) -> None:
        """Click the 'Log In' submit button."""
        self._page.get_by_role("button", name="Log In").click()

    def login(self, email: str, password: str) -> None:
        """Fill credentials and submit in one call.

        Args:
            email: User email.
            password: User password.
        """
        self.fill_email(email).fill_password(password).submit()

    # ------------------------------------------------------------------
    # Readable state
    # ------------------------------------------------------------------

    @property
    def error_message(self) -> str | None:
        """Return the API error text shown after a failed login, or None.

        Returns:
            Error message string, or None if not visible.
        """
        locator = self._page.locator(".login-error")
        if locator.is_visible():
            return locator.inner_text()
        return None

    @property
    def email_validation_error(self) -> str | None:
        """Return inline email field validation error, or None.

        Returns:
            Validation error string, or None if not visible.
        """
        locator = self._page.locator(".auth-field:has(#email) .auth-field__error")
        if locator.count() > 0 and locator.first.is_visible():
            return locator.first.inner_text()
        return None

    @property
    def password_validation_error(self) -> str | None:
        """Return inline password field validation error, or None.

        Returns:
            Validation error string, or None if not visible.
        """
        locator = self._page.locator(".auth-field:has(#password) .auth-field__error")
        if locator.count() > 0 and locator.first.is_visible():
            return locator.first.inner_text()
        return None

    @property
    def has_any_validation_error(self) -> bool:
        """Return True if any field-level validation error message is visible.

        Returns:
            True if at least one .auth-field__error element is shown.
        """
        return self._page.locator(".auth-field__error").count() > 0

    @property
    def is_submit_disabled(self) -> bool:
        """Return True when the submit button is disabled (pending request).

        Returns:
            True if the button is disabled.
        """
        return self._page.get_by_role("button", name="Log In").is_disabled()
