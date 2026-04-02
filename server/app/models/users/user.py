from pydantic import BaseModel, Field

from app.models.enums.role import Role


class LoginResponse(BaseModel):
    email: str
    password: str = Field(exclude=True)
    role: Role
    first_name: str

class LoginRequest(BaseModel):
    email: str
    password: str
    role: Role


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Role


class RegisterResponse(BaseModel):
    name: str
    email: str
    role: Role
