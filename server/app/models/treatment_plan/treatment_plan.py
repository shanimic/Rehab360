import datetime

from pydantic import BaseModel, Field, field_validator, model_validator


class TreatmentPlanContext(BaseModel):
    """Session context returned for the create-treatment-plan page."""

    session_id: int
    medical_diagnosis: str
    visit_type: str


class PhysiotherapyExerciseItem(BaseModel):
    """A single physiotherapy exercise returned for the add-exercise popup."""

    exercise_id: int
    exercise_name: str


class PlanExerciseRequest(BaseModel):
    """One exercise entry within a create-treatment-plan request."""

    exercise_id: int
    reps: int
    num_sets: int
    weight: float
    time_duration: int
    time_unit: str
    description: str | None = None


class CreateTreatmentPlanRequest(BaseModel):
    """Request body for creating a new treatment plan.

    session_id is supplied as a URL path parameter, not in this body.
    """

    goal: str
    start_date: datetime.date
    end_date: datetime.date
    notes: str | None = None
    exercises: list[PlanExerciseRequest] = Field(min_length=1)

    @field_validator("goal")
    @classmethod
    def goal_not_blank(cls, value: str) -> str:
        """Reject empty or whitespace-only goal.

        Args:
            value: The raw goal string from the request.

        Returns:
            The stripped value if non-empty.

        Raises:
            ValueError: If value is blank or whitespace only.
        """
        if not value.strip():
            raise ValueError("goal must not be empty or whitespace")
        return value

    @model_validator(mode="after")
    def end_date_after_start_date(self) -> "CreateTreatmentPlanRequest":
        """Ensure end_date is strictly after start_date.

        Returns:
            The validated model instance.

        Raises:
            ValueError: If end_date is not after start_date.
        """
        if self.end_date <= self.start_date:
            raise ValueError("end_date must be after start_date")
        return self


class CreateTreatmentPlanResponse(BaseModel):
    """Response returned after a treatment plan is created."""

    plan_id: int
    session_id: int
