"""Base page object — all other POMs inherit from this."""

from __future__ import annotations

from playwright.sync_api import Locator, Page


class BasePage:
    """Shared foundation for every page object.

    Attributes:
        _page: The Playwright Page instance.
    """

    def __init__(self, page: Page) -> None:
        self._page = page

    # ------------------------------------------------------------------
    # Navigation helpers
    # ------------------------------------------------------------------

    def goto(self, path: str) -> None:
        """Navigate to a path relative to base_url.

        Args:
            path: URL path starting with '/'.
        """
        self._page.goto(path)

    def wait_for_url(self, pattern: str) -> None:
        """Block until the current URL matches *pattern*.

        Args:
            pattern: Substring or regex that must appear in the URL.
        """
        self._page.wait_for_url(f"**{pattern}**")

    # ------------------------------------------------------------------
    # Common element helpers
    # ------------------------------------------------------------------

    @property
    def page(self) -> Page:
        """Expose the raw Playwright Page for assertions in tests."""
        return self._page

    def locator(self, selector: str) -> Locator:
        """Return a locator scoped to this page.

        Args:
            selector: CSS or XPath selector string.
        """
        return self._page.locator(selector)
