import datetime

from pydantic import BaseModel


class ProfileData(BaseModel):
    """Personal info returned for any user role."""

    last_name: str
    email: str
    phone: str
    birth_date: datetime.date
    license_number: str | None = None


class ActivePlan(BaseModel):
    """One active plan with its overall completion percentage."""

    plan_id: int
    goal: str
    category: str
    start_date: datetime.date
    end_date: datetime.date
    completion_percent: float | None = None
