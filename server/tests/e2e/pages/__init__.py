"""Page Object Model (POM) package for Rehab360 e2e tests.

Import page objects from here rather than from individual modules:

    from tests.e2e.pages import LandingPage, LoginPage, PatientHomePage
"""

from tests.e2e.pages.base_page import BasePage
from tests.e2e.pages.landing_page import LandingPage
from tests.e2e.pages.login_page import LoginPage
from tests.e2e.pages.role_select_page import RoleSelectPage
from tests.e2e.pages.signup_page import SignUpPage
from tests.e2e.pages.top_nav import TopNav

# Patient pages
from tests.e2e.pages.patient.all_visit_summaries_page import AllVisitSummariesPage
from tests.e2e.pages.patient.exercise_report_page import ExerciseReportPage
from tests.e2e.pages.patient.my_plan_page import MyPlanPage
from tests.e2e.pages.patient.patient_details_page import PatientDetailsPage
from tests.e2e.pages.patient.patient_home_page import PatientHomePage
from tests.e2e.pages.patient.view_treatment_plan_page import ViewTreatmentPlanPage

# Professional pages
from tests.e2e.pages.professional.create_treatment_plan_page import CreateTreatmentPlanPage
from tests.e2e.pages.professional.create_visit_summary_page import CreateVisitSummaryPage
from tests.e2e.pages.professional.home_page import ProfessionalHomePage

# Shared pages
from tests.e2e.pages.shared.ai_search_page import AiSearchPage
from tests.e2e.pages.shared.saved_content_page import SavedContentPage

__all__ = [
    "AiSearchPage",
    "AllVisitSummariesPage",
    "BasePage",
    "CreateTreatmentPlanPage",
    "CreateVisitSummaryPage",
    "ExerciseReportPage",
    "LandingPage",
    "LoginPage",
    "MyPlanPage",
    "PatientDetailsPage",
    "PatientHomePage",
    "ProfessionalHomePage",
    "RoleSelectPage",
    "SavedContentPage",
    "SignUpPage",
    "TopNav",
    "ViewTreatmentPlanPage",
]
