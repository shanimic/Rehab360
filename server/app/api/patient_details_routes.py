from fastapi import APIRouter, Depends, Query

from app.dal.patient_details_repository import PatientDetailsRepository
from app.db.session import get_db
from app.models.enums.role import Role
from app.models.patient_details.patient_details import PatientDetailsResponse
from app.services.patient_details_services import PatientDetailsServices

patient_details_router = APIRouter()


@patient_details_router.get(
    "/{patient_id}",
    tags=["Patient Details"],
    response_model=PatientDetailsResponse,
)
async def get_patient_details(
    patient_id: str,
    viewer_role: Role | None = Query(default=None),
    db=Depends(get_db),
) -> PatientDetailsResponse:
    """Return aggregated patient details for the Patient Details page.

    Args:
        patient_id: The patient's user ID from the URL path.
        viewer_role: Optional role of the viewing user for frontend role-based rendering.
        db: Injected database cursor.

    Returns:
        A PatientDetailsResponse with patient info, latest visit summary, and active plans.
    """
    repo = PatientDetailsRepository(db=db)
    service = PatientDetailsServices(repository=repo)
    return await service.get_patient_details(patient_id, viewer_role)
