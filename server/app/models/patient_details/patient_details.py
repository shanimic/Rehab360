import datetime

from pydantic import BaseModel, field_validator

from app.models.enums.role import Role


class PatientBasicInfo(BaseModel):
    """Basic patient profile returned as part of the patient details response."""

    user_id: str
    first_name: str
    last_name: str
    phone: str
    birth_date: datetime.date
    email: str


class LatestVisitSummary(BaseModel):
    """Most recent active session returned as part of the patient details response."""

    session_id: int
    visit_date: datetime.date
    visit_time: datetime.time
    visit_type: str
    therapist_name: str
    description: str | None

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


class CurrentPlanWithProgress(BaseModel):
    """Active plan with calculated progress returned as part of the patient details response."""

    plan_id: int
    session_id: int
    medical_diagnosis: str
    start_date: datetime.date
    end_date: datetime.date
    progress_percentage: float
    last_progress_update: datetime.date | None


class PatientDetailsResponse(BaseModel):
    """Aggregated patient details response for the Patient Details page."""

    patient: PatientBasicInfo
    latest_visit_summary: LatestVisitSummary | None
    treatment_plan: CurrentPlanWithProgress | None
    fitness_plan: CurrentPlanWithProgress | None
    viewer_role: Role | None = None
