"""Page object for the Patient Details / My Process page.

Used both by patients (/patient/my-process) and professionals
(/physiotherapist/patient/:id, /fitness/patient/:id).
"""

from __future__ import annotations

from tests.e2e.pages.base_page import BasePage
from tests.e2e.pages.top_nav import TopNav


class PatientDetailsPage(BasePage):
    """Models the patient profile card, progress summary, and plan navigation links."""

    PATIENT_URL = "/patient/my-process"

    def __init__(self, page) -> None:
        super().__init__(page)
        self.nav = TopNav(page)

    def goto_as_patient(self) -> PatientDetailsPage:
        """Navigate directly to the patient's own My Process page.

        Returns:
            Self, for chaining.
        """
        self._page.goto(self.PATIENT_URL)
        return self

    def goto_as_professional(self, patient_id: str, role: str = "physiotherapist") -> PatientDetailsPage:
        """Navigate to a professional's view of a patient.

        Args:
            patient_id: The patient's ID string (e.g. 'P100').
            role: 'physiotherapist' or 'fitness'.

        Returns:
            Self, for chaining.
        """
        self._page.goto(f"/{role}/patient/{patient_id}")
        return self

    # ------------------------------------------------------------------
    # Actions
    # ------------------------------------------------------------------

    def go_to_visit_summaries(self) -> None:
        """Click 'View All Summaries' in the Visit Summaries info card."""
        self._page.get_by_role("link", name="View All Summaries").click()

    def go_to_treatment_plan(self) -> None:
        """Click 'Go to Current Treatment Plan' in the Treatment Plan card."""
        self._page.get_by_text("Go to Current Treatment Plan").click()

    def go_to_fitness_plan(self) -> None:
        """Click 'Go to Current Fitness Plan' in the Fitness Plan card."""
        self._page.get_by_text("Go to Current Fitness Plan").click()

    def go_back(self) -> None:
        """Click the back arrow in the page header."""
        self._page.locator(".patient-nav__back").click()

    # ------------------------------------------------------------------
    # Readable state
    # ------------------------------------------------------------------

    @property
    def patient_name(self) -> str:
        """Return the patient's display name from the profile card.

        Returns:
            Name string.
        """
        return self._page.locator(".patient-profile-card__name").inner_text()

    @property
    def is_loading(self) -> bool:
        """Return True while patient data is still being fetched.

        Returns:
            True if the loading state is visible.
        """
        return self._page.locator(".patient-empty-state").is_visible()

    @property
    def has_treatment_plan(self) -> bool:
        """Return True when an active treatment plan link is shown.

        Returns:
            True if 'Go to Current Treatment Plan' is present.
        """
        return self._page.get_by_text("Go to Current Treatment Plan").is_visible()

    @property
    def has_fitness_plan(self) -> bool:
        """Return True when an active fitness plan link is shown.

        Returns:
            True if 'Go to Current Fitness Plan' is present.
        """
        return self._page.get_by_text("Go to Current Fitness Plan").is_visible()
