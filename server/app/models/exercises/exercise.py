import datetime

from pydantic import BaseModel, field_validator
from app.models.patients.visit_type import VisitType
from app.models.patients.patient_exercises import DailyExerciseItem


def _execution_status_to_bool(value: object) -> bool:
    """Coerce DB tinyint (0/1) to bool; only ``1`` is ``True``."""
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    return int(value) == 1


class ExerciseReportMetadata(BaseModel):
    """Exercise report metadata."""

    exercise_name: str
    visit_type: VisitType
    reps: int
    num_sets: int
    execution_status: bool
    num_exe_completed: int
    ex_video_url: str
    text_instructions: str
    session_id: int
    weekly_plan_id: int
    plan_id: int
    execution_date: datetime.date | None = None
    reason_for_non_performance: str | None = None
    pain_level: int | None = None
    effort_level: int | None = None
    request_for_change: str | None = None

    @field_validator("execution_status", mode="before")
    @classmethod
    def execution_status_to_bool(cls, value: object) -> bool:
        """Coerce DB tinyint (0/1) to bool; only ``1`` is ``True``."""
        return _execution_status_to_bool(value)

class ExerciseReport(BaseModel):
    """Exercise report."""

    execution_status: bool
    reason_for_non_performance: str | None = None
    pain_level: int
    effort_level: int
    request_for_change: str | None = None

class ExerciseData(BaseModel):
    """Exercise data."""

    exercise_name: str
    visit_type: VisitType
    reps: int
    num_sets: int
    execution_status: bool
    ex_video_url: str
    text_instructions: str


class PatientPlanExercise(BaseModel):
    """One exercise row from a patient's active daily plan."""

    exercise_id: int
    exercise_name: str
    visit_type: VisitType
    reps: int
    execution_status: bool
    ex_video_url: str
    text_instructions: str
    session_id: int
    weekly_plan_id: int
    plan_id: int

    @field_validator("execution_status", mode="before")
    @classmethod
    def execution_status_to_bool(cls, value: object) -> bool:
        """Coerce DB tinyint (0/1) to bool; only ``1`` is ``True``."""
        return _execution_status_to_bool(value)

class MyPlanResponse(BaseModel):
    """Response model for patient's active plan, including today's and tomorrow's exercises."""

    today_exercises: list[DailyExerciseItem] = []
    tomorrow_exercises: list[DailyExerciseItem] = []
