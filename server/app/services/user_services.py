from fastapi import HTTPException, status

from app.core.security import hash_password, verify_password
from app.dal.user_repository import UserRepository
from app.models.users.user import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse


class UserServices:
    def __init__(self, repository: UserRepository):
        self.repository = repository

    async def authenticate_user(self, login_request: LoginRequest) -> LoginResponse:
        # 1. Get the user from DB by email only
        user = await self.repository.get_user_for_auth(login_request)
        
        # 2. If user doesn't exist or password doesn't match
        if not user or not verify_password(login_request.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # 3. Return the user (optionally strip the password here)
        return user

    async def register_user(self, register_request: RegisterRequest) -> RegisterResponse:
        existing = await self.repository.get_user_for_auth(
            LoginRequest(email=register_request.email, password="", role=register_request.role)
        )
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")

        register_request.password = hash_password(register_request.password)
        return await self.repository.create_user(register_request)