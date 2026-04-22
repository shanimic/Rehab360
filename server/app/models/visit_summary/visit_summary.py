import datetime

from pydantic import BaseModel, Field

from app.models.enums.role import Role


class PatientDetails(BaseModel):
    """Patient details returned for the create-visit-summary page."""

    patient_id: str
    patient_first_name: str
    patient_last_name: str
    phone: str
    birth_date: datetime.date
    email: str
    plan_id: int | None = None
    visit_date: datetime.date = Field(default_factory=datetime.date.today)
    visit_time: datetime.time = Field(
        default_factory=lambda: datetime.datetime.now().time().replace(microsecond=0)
    )


class CreateVisitSummaryRequest(BaseModel):
    """Request body for creating a new visit summary."""

    visit_date: datetime.date = Field(default_factory=datetime.date.today)
    visit_time: datetime.time = Field(default_factory=lambda: datetime.datetime.now().time().replace(microsecond=0))
    treatment_area: str
    medical_diagnosis: str
    description: str
    recommendations: str | None = None
    patient_id: str
    therapist_id: str
    therapist_role: Role


class CreateVisitSummaryResponse(BaseModel):
    """Response returned after a visit summary is created."""

    session_id: int
