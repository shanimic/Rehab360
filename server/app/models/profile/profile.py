from pydantic import BaseModel


class ProfileData(BaseModel):
    """Personal info returned for any user role."""

    last_name: str
    email: str
    phone: str
    birth_date: str
    license_number: str | None = None


class ActivePlan(BaseModel):
    """One active plan with its overall completion percentage."""

    plan_id: int
    goal: str
    category: str
    start_date: str
    end_date: str
    completion_percent: float | None = None
