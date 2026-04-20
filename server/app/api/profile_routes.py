from fastapi import APIRouter, Depends

from app.dal.profile_repository import ProfileRepository
from app.db.session import get_db
from app.models.profile.profile import ActivePlan, ProfileData
from app.services.profile_services import ProfileServices

profile_router = APIRouter()


@profile_router.get("/{user_id}", tags=["Profile"], response_model=ProfileData)
async def get_profile(user_id: str, db=Depends(get_db)):
    profile_repository = ProfileRepository(db=db)
    profile_service = ProfileServices(repository=profile_repository)
    return await profile_service.get_profile_data(user_id)


@profile_router.get("/{user_id}/plans", tags=["Profile"], response_model=list[ActivePlan])
async def get_patient_plans(user_id: str, db=Depends(get_db)):
    profile_repository = ProfileRepository(db=db)
    profile_service = ProfileServices(repository=profile_repository)
    return await profile_service.get_active_patient_plans(user_id)
