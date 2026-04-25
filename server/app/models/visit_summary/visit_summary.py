import datetime

from pydantic import BaseModel, Field, field_validator

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


class SessionListItem(BaseModel):
    """A single session row returned in the patient's visit-summary list."""

    session_id: int
    visit_date: datetime.date
    visit_time: datetime.time
    visit_type: str
    treatment_area: str
    medical_diagnosis: str
    description: str
    therapist_first_name: str
    therapist_last_name: str

    @field_validator("visit_time", mode="before")
    @classmethod
    def coerce_timedelta_to_time(cls, value: object) -> object:  # type: ignore[override]
        """Convert aiomysql timedelta to datetime.time for TIME columns.

        Args:
            value: The raw value from the database cursor.

        Returns:
            A datetime.time if value is a timedelta, otherwise the value unchanged.
        """
        if isinstance(value, datetime.timedelta):
            total_seconds = int(value.total_seconds())
            return datetime.time(
                total_seconds // 3600,
                (total_seconds % 3600) // 60,
                total_seconds % 60,
            )
        return value


class CreatePlanRequest(BaseModel):
    """Request body for creating a new treatment plan linked to a session."""

    session_id: int
    goal: str
    start_date: datetime.date
    end_date: datetime.date


class CreatePlanResponse(BaseModel):
    """Response returned after a treatment plan is created."""

    plan_id: int
    session_id: int
