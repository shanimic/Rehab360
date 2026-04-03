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
    first_name: str
    last_name: str
    email: str
    password: str
    phone: str
    birth_date: str
    role: Role
    license_number: str | None = None


class RegisterResponse(BaseModel):
    first_name: str
    last_name: str
    email: str
    role: Role
