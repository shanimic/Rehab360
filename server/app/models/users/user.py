from pydantic import BaseModel, Field

from app.models.enums.role import Role


class LoginResponse(BaseModel):
    email: str
    password: str = Field(exclude=True)
    role: Role

class LoginRequest(BaseModel):
    email: str
    password: str
    role: Role
