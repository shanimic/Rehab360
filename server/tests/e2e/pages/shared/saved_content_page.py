"""Page object for the Saved Content page at '/ai-search/saved'."""

from __future__ import annotations

from playwright.sync_api import Locator

from tests.e2e.pages.base_page import BasePage
from tests.e2e.pages.top_nav import TopNav


class SavedContentPage(BasePage):
    """Models the personal content library for any role.

    Notes:
        The 'Verify' button is only visible to Physiotherapist and Fitness Trainer
        roles.  Tests for patient role should assert it is absent.
    """

    URL = "/ai-search/saved"

    def __init__(self, page) -> None:
        super().__init__(page)
        self.nav = TopNav(page)

    def goto(self) -> SavedContentPage:
        """Navigate directly to the Saved Content page.

        Returns:
            Self, for chaining.
        """
        self._page.goto(self.URL)
        return self

    # ------------------------------------------------------------------
    # Actions
    # ------------------------------------------------------------------

    def delete_item(self, index: int = 0) -> SavedContentPage:
        """Click the remove/delete button on the nth saved item (0-based).

        Args:
            index: Zero-based position in the saved items list.

        Returns:
            Self, for chaining.
        """
        self._page.locator("[aria-label*='Remove'], [aria-label*='Delete']").nth(index).click()
        return self

    def verify_item(self, index: int = 0) -> SavedContentPage:
        """Click the Verify button on the nth saved item (professionals only).

        Args:
            index: Zero-based position in the saved items list.

        Returns:
            Self, for chaining.
        """
        self._page.get_by_role("button", name="Verify").nth(index).click()
        return self

    def go_back(self) -> None:
        """Navigate back via the browser or top-nav."""
        self._page.go_back()

    # ------------------------------------------------------------------
    # Readable state
    # ------------------------------------------------------------------

    @property
    def saved_items(self) -> Locator:
        """Return the locator for all saved content cards.

        Returns:
            Locator for saved item elements.
        """
        return self._page.locator(".saved-item, [class*='saved-content-item']")

    @property
    def item_count(self) -> int:
        """Return the number of saved items currently visible.

        Returns:
            Integer count.
        """
        return self.saved_items.count()

    @property
    def verify_button_visible(self) -> bool:
        """Return True when at least one Verify button is shown (professionals only).

        Returns:
            True if any Verify button is visible.
        """
        btn = self._page.get_by_role("button", name="Verify")
        return btn.count() > 0 and btn.first.is_visible()

    @property
    def is_empty(self) -> bool:
        """Return True when no saved items are present.

        Returns:
            True if the empty state is visible.
        """
        return self.item_count == 0
