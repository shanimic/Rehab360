from fastapi import APIRouter, Depends

from app.dal.homepage_repository import HomepageRepository
from app.db.session import get_db
from app.models.enums.role import Role
from app.models.homepage.homepage import AllPatientItem, HomePatientCard
from app.services.homepage_services import HomepageServices

homepage_router = APIRouter()


@homepage_router.get(
    "/patients",
    tags=["Homepage"],
    response_model=list[HomePatientCard],
)
async def get_home_patients(
    therapist_id: str,
    therapist_role: Role,
    db=Depends(get_db),
) -> list[HomePatientCard]:
    """Return patient cards for the therapist's homepage.

    Each card represents a patient the therapist has previously visited,
    showing the most-recent medical diagnosis and overall progress percentage
    for the therapist's visit type.

    Args:
        therapist_id: The unique identifier of the logged-in therapist.
        therapist_role: The role of the logged-in therapist.
        db: Database cursor injected by FastAPI.

    Returns:
        A list of HomePatientCard instances ordered by most-recent visit.
    """
    repository = HomepageRepository(db=db)
    service = HomepageServices(repository=repository)
    return await service.get_home_patients(therapist_id, therapist_role)


@homepage_router.get(
    "/all-patients",
    tags=["Homepage"],
    response_model=list[AllPatientItem],
)
async def get_all_patients(
    db=Depends(get_db),
) -> list[AllPatientItem]:
    """Return all patients for the new-visit-summary modal.

    Args:
        db: Database cursor injected by FastAPI.

    Returns:
        A list of AllPatientItem instances ordered alphabetically by name.
    """
    repository = HomepageRepository(db=db)
    service = HomepageServices(repository=repository)
    return await service.get_all_patients()
