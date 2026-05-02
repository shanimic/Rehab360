from enum import Enum
from pydantic import BaseModel, Field, field_validator
from app.models.patients.visit_type import VisitType


class DailyExerciseItem(BaseModel):
    """One exercise row for the patient's daily plan."""

    exercise_id: int
    exercise_name: str
    visit_type: VisitType
    reps: int
    execution_status: bool
    num_sets: int
    text_instructions: str

    
    @classmethod
    @field_validator("execution_status", mode="before")
    def execution_status_to_bool(cls, value: object) -> bool:
        """Coerce DB tinyint (0/1) to bool; only ``1`` is ``True``."""
        if isinstance(value, bool):
            return value
        if value is None:
            return False
        return int(value) == 1

class WeeklyScheduleItem(BaseModel):
    """One exercise row from the patient's active weekly plan."""

    exercise_id: int
    exercise_name: str
    visit_type: VisitType
    reps: int
    num_sets: int
    time_duration: int
    time_unit: str


class WeeklyCompletion(BaseModel):
    exe_comp: int = Field(alias="EXECOMP",by_alias=True, description="Number of exercises completed this week") # Nominator
    exe_tdw: int = Field(alias="EXETDW",by_alias=True, description="Number of exercises to be completed this week") # Denominator


class DailyCompletion(BaseModel):
    completed_sum: int
    total: int


class PatientHomeData(BaseModel):
    """Data returned for patient home."""
    daily_exercises: list[DailyExerciseItem]
    weekly_completion: WeeklyCompletion
    fitness_percentage: float
    physiotherapist_percentage: float
    daily_completions: DailyCompletion
