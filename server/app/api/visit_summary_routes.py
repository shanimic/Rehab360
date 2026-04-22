from fastapi import APIRouter, Depends

from app.dal.visit_summary_repository import VisitSummaryRepository
from app.db.session import get_db
from app.models.visit_summary.visit_summary import (
    CreateVisitSummaryRequest,
    CreateVisitSummaryResponse,
    PatientDetails,
)
from app.services.visit_summary_services import VisitSummaryServices

visit_summary_router = APIRouter()


@visit_summary_router.get(
    "/patient/{patient_id}",
    tags=["Visit Summary"],
    response_model=PatientDetails,
)
async def get_patient_details(patient_id: str, db=Depends(get_db)) -> PatientDetails:
    """Return details for a patient by ID.

    Args:
        patient_id: The unique identifier of the patient.
        db: Database cursor injected by FastAPI.

    Returns:
        PatientDetails for the requested patient.
    """
    visit_summary_repository = VisitSummaryRepository(db=db)
    visit_summary_service = VisitSummaryServices(repository=visit_summary_repository)
    return await visit_summary_service.get_patient_details(patient_id)


@visit_summary_router.post(
    "",
    tags=["Visit Summary"],
    response_model=CreateVisitSummaryResponse,
)
async def create_visit_summary(
    request: CreateVisitSummaryRequest, db=Depends(get_db)
) -> CreateVisitSummaryResponse:
    """Create a new visit summary and return the generated session ID.

    Args:
        request: The visit summary payload.
        db: Database cursor injected by FastAPI.

    Returns:
        CreateVisitSummaryResponse containing the new session_id.
    """
    visit_summary_repository = VisitSummaryRepository(db=db)
    visit_summary_service = VisitSummaryServices(repository=visit_summary_repository)
    return await visit_summary_service.create_visit_summary(request)
