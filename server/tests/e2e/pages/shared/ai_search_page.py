"""Page object for the AI Search page at '/ai-search'."""

from __future__ import annotations

from tests.e2e.pages.base_page import BasePage
from tests.e2e.pages.top_nav import TopNav


class AiSearchPage(BasePage):
    """Models the Gemini-powered AI search interface (all roles)."""

    URL = "/ai-search"

    def __init__(self, page) -> None:
        super().__init__(page)
        self.nav = TopNav(page)

    def goto(self, path: str = "") -> AiSearchPage:
        """Navigate directly to the AI Search page.

        Args:
            path: Ignored; always navigates to the AI Search URL.

        Returns:
            Self, for chaining.
        """
        self._page.goto(self.URL)
        return self

    # ------------------------------------------------------------------
    # Actions
    # ------------------------------------------------------------------

    def fill_query(self, text: str) -> AiSearchPage:
        """Type a query into the search textarea.

        Args:
            text: Natural-language query string.

        Returns:
            Self, for chaining.
        """
        self._page.get_by_placeholder("Ask about your recovery, exercises, or diagnosis…").fill(text)
        return self

    def submit_query(self) -> AiSearchPage:
        """Click the 'Ask' submit button.

        Returns:
            Self, for chaining.
        """
        self._page.get_by_role("button", name="Ask").click()
        return self

    def search(self, text: str) -> AiSearchPage:
        """Fill and submit a query in one call.

        Args:
            text: Query text.

        Returns:
            Self, for chaining.
        """
        return self.fill_query(text).submit_query()

    def click_chip(self, label: str) -> AiSearchPage:
        """Click a suggested topic chip to pre-fill the query.

        Args:
            label: Chip label text (e.g. 'Post-surgery pain').

        Returns:
            Self, for chaining.
        """
        self._page.get_by_role("button", name=label).click()
        return self

    def click_new_chat(self) -> AiSearchPage:
        """Click 'New Chat' to clear the conversation and return to idle state.

        Returns:
            Self, for chaining.
        """
        self._page.get_by_role("button", name="New Chat").click()
        return self

    def fill_followup(self, text: str) -> AiSearchPage:
        """Type into the follow-up bar that appears after the first result.

        Args:
            text: Follow-up query text.

        Returns:
            Self, for chaining.
        """
        self._page.get_by_placeholder("Ask a follow-up…").fill(text)
        return self

    def go_back(self) -> None:
        """Click the back-to-home arrow."""
        self._page.get_by_role("button", name="Back to home").click()

    # ------------------------------------------------------------------
    # Readable state
    # ------------------------------------------------------------------

    @property
    def is_idle(self) -> bool:
        """Return True when no search has been run yet (chip suggestions visible).

        Returns:
            True if the idle disclaimer is visible.
        """
        return self._page.locator(".ais-page__idle-disclaimer").is_visible()

    @property
    def has_results(self) -> bool:
        """Return True once a search result is displayed.

        Returns:
            True if the results container is visible.
        """
        return self._page.locator(".ais-page__results-container").is_visible()

    @property
    def is_asking(self) -> bool:
        """Return True while a query is in-flight.

        Returns:
            True if the submit button shows 'Asking…'.
        """
        return self._page.get_by_text("Asking…").is_visible()
