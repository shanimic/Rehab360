"""Business logic for reading exercise details and recording patient reports."""

import datetime
from itertools import groupby

from fastapi import HTTPException

from app.dal.exercise_repository import ExerciseRepository
from app.models.exercises.exercise import (
    ExerciseData,
    ExerciseReport,
    MyPlanResponse,
    WeeklyDayPlan,
    WeeklyPlanResponse,
)
from app.models.patients.patient_exercises import DailyExerciseItem


class ExerciseServices:
    """Business logic for reading exercise details and recording patient reports."""

    def __init__(self, repository: ExerciseRepository) -> None:
        """Wire the exercise repository used for metadata and completion writes.

        Args:
            repository: Data access layer for exercise SQL operations.
        """
        self.repository = repository

    async def get_patient_plan(self, patient_id: str) -> MyPlanResponse:
        """Return all exercises in the patient's active plan for today.

        Args:
            patient_id: Patient identifier.

        Returns:
            List of ``DailyExerciseItem`` for today's active session.
        """
        today_plan = await self.repository.get_patient_plan(patient_id=patient_id)
        tommorow_plan = await self.repository.get_tommorow_exercises(
            patient_id=patient_id
        )
        return MyPlanResponse(
            today_exercises=today_plan, tomorrow_exercises=tommorow_plan
        )

    async def get_exercise(self, exercise_id: str, patient_id: str) -> ExerciseData:
        """Map persisted exercise metadata to the API-facing exercise payload.

        Args:
            exercise_id: Exercise identifier.
            patient_id: Patient identifier.

        Returns:
            ``ExerciseData`` without internal plan/session identifiers.

        Raises:
            AttributeError: If metadata lookup returns ``None`` (caller should handle or validate).
        """
        metadata = await self.repository.get_exercise_report_metadata(
            exercise_id=exercise_id, patient_id=patient_id
        )
        if metadata is None:
            raise HTTPException(
                status_code=404, detail="Exercise not found for this patient today"
            )
        return ExerciseData(
            exercise_name=metadata.exercise_name,
            visit_type=metadata.visit_type,
            reps=metadata.reps,
            num_sets=metadata.num_sets,
            execution_status=metadata.execution_status,
            ex_video_url=metadata.ex_video_url,
            text_instructions=metadata.text_instructions,
        )

    async def get_weekly_plan(self, patient_id: str) -> WeeklyPlanResponse:
        """Return exercises grouped by day for the next five days (day+2 through day+6).

        Args:
            patient_id: Patient identifier.

        Returns:
            ``WeeklyPlanResponse`` with one ``WeeklyDayPlan`` entry per day that has exercises.
        """
        rows = await self.repository.get_week_exercises(patient_id=patient_id)
        days: list[WeeklyDayPlan] = []
        for date_val, group in groupby(rows, key=lambda r: r["exercise_date"]):
            if isinstance(date_val, str):
                date_obj = datetime.date.fromisoformat(date_val)
            else:
                date_obj = datetime.date(date_val.year, date_val.month, date_val.day)
            day_label = date_obj.strftime(f"%A, %b {date_obj.day}")
            exercises = [DailyExerciseItem.model_validate(row) for row in group]
            days.append(WeeklyDayPlan(
                date=date_obj.isoformat(),
                day_label=day_label,
                exercises=exercises,
            ))
        return WeeklyPlanResponse(days=days)

    async def post_exercise_report(
        self, exercise_id: str, patient_id: str, report: ExerciseReport
    ) -> None:
        """Forward the patient report to the repository for insert.

        Args:
            exercise_id: Exercise identifier.
            patient_id: Patient identifier.
            report: Execution status and subjective feedback fields.

        Returns:
            None
        """
        return await self.repository.post_exercise_report(
            exercise_id=exercise_id, patient_id=patient_id, report=report
        )
