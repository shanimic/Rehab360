"""Page object for the Sign-Up page at '/signup'."""

from __future__ import annotations

from tests.e2e.pages.base_page import BasePage


class SignUpPage(BasePage):
    """Models the new-account registration form.

    Notes:
        Role comes from ``location.state.role``; defaults to ``'patient'`` on
        direct URL navigation.  The ``license_number`` field only renders for
        ``physiotherapist`` and ``trainer`` roles.

        On success the app navigates to ``/dashboard`` (a route that does not
        exist), so the catch-all redirects to ``/``.
    """

    # ------------------------------------------------------------------
    # Field-filling actions
    # ------------------------------------------------------------------

    def fill_user_id(self, value: str) -> SignUpPage:
        """Fill the ID Number field.

        Args:
            value: Unique user ID (e.g. 'P999').

        Returns:
            Self, for chaining.
        """
        self._page.locator("#user_id").fill(value)
        return self

    def fill_first_name(self, value: str) -> SignUpPage:
        """Fill the First Name field.

        Args:
            value: First name string.

        Returns:
            Self, for chaining.
        """
        self._page.locator("#first_name").fill(value)
        return self

    def fill_last_name(self, value: str) -> SignUpPage:
        """Fill the Last Name field.

        Args:
            value: Last name string.

        Returns:
            Self, for chaining.
        """
        self._page.locator("#last_name").fill(value)
        return self

    def fill_email(self, value: str) -> SignUpPage:
        """Fill the Email field.

        Args:
            value: Email address string.

        Returns:
            Self, for chaining.
        """
        self._page.locator("#email").fill(value)
        return self

    def fill_password(self, value: str) -> SignUpPage:
        """Fill the Password field.

        Args:
            value: Password string (min 8 characters).

        Returns:
            Self, for chaining.
        """
        self._page.locator("#password").fill(value)
        return self

    def fill_phone(self, value: str) -> SignUpPage:
        """Fill the Phone Number field.

        Args:
            value: Phone string.

        Returns:
            Self, for chaining.
        """
        self._page.locator("#phone").fill(value)
        return self

    def fill_birth_date(self, value: str) -> SignUpPage:
        """Fill the Date of Birth field.

        Args:
            value: Date string in YYYY-MM-DD format.

        Returns:
            Self, for chaining.
        """
        self._page.locator("#birth_date").fill(value)
        return self

    def fill_license_number(self, value: str) -> SignUpPage:
        """Fill the License Number field (professionals only).

        Args:
            value: License number string.

        Returns:
            Self, for chaining.
        """
        self._page.locator("#license_number").fill(value)
        return self

    def fill_patient_form(  # pylint: disable=too-many-arguments,too-many-positional-arguments
        self,
        user_id: str,
        first_name: str,
        last_name: str,
        email: str,
        password: str,
        phone: str,
        birth_date: str,
    ) -> SignUpPage:
        """Convenience: fill all required patient fields at once.

        Args:
            user_id: Unique user ID.
            first_name: First name.
            last_name: Last name.
            email: Email address.
            password: Password (min 8 chars).
            phone: Phone number.
            birth_date: Birth date in YYYY-MM-DD.

        Returns:
            Self, for chaining.
        """
        return (
            self.fill_user_id(user_id)
            .fill_first_name(first_name)
            .fill_last_name(last_name)
            .fill_email(email)
            .fill_password(password)
            .fill_phone(phone)
            .fill_birth_date(birth_date)
        )

    def submit(self) -> None:
        """Click the 'Sign Up' button."""
        self._page.get_by_role("button", name="Sign Up").click()

    # ------------------------------------------------------------------
    # Readable state
    # ------------------------------------------------------------------

    @property
    def validation_errors(self) -> list[str]:
        """Return all visible field-level validation error messages.

        Returns:
            List of error strings (may be empty).
        """
        return self._page.locator(".auth-field__error").all_inner_texts()

    @property
    def has_any_error(self) -> bool:
        """Return True if any field-level error is shown.

        Returns:
            True if at least one .auth-field__error element exists.
        """
        return len(self.validation_errors) > 0

    @property
    def is_submitting(self) -> bool:
        """Return True while the sign-up request is in-flight.

        Returns:
            True if 'Creating account...' text is visible.
        """
        return self._page.get_by_text("Creating account...").is_visible()
