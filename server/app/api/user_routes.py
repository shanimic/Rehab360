from fastapi import APIRouter, Depends

from app.dal.user_repository import UserRepository
from app.models.users.user import LoginRequest, LoginResponse
from app.db.session import get_db
from app.services.user_services import UserServices

user_router = APIRouter()

@user_router.post("/login", tags=["Users"], response_model=LoginResponse)
async def login(request: LoginRequest, db=Depends(get_db)):
    user_repository = UserRepository(db=db)
    user_service = UserServices(repository=user_repository)

    return await user_service.authenticate_user(request)
