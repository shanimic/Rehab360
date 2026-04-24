from app.models.exercises.exercise import ExerciseData, ExerciseReport
from app.models.patients.patient_exercises import DailyExerciseItem
from app.dal.exercise_repository import ExerciseRepository



class ExerciseServices:
    """Business logic for reading exercise details and recording patient reports."""

    def __init__(self, repository: ExerciseRepository) -> None:
        """Wire the exercise repository used for metadata and completion writes.

        Args:
            repository: Data access layer for exercise SQL operations.
        """
        self.repository = repository

    async def get_patient_plan(self, patient_id: str) -> list[DailyExerciseItem]:
        """Return all exercises in the patient's active plan for today.

        Args:
            patient_id: Patient identifier.

        Returns:
            List of ``DailyExerciseItem`` for today's active session.
        """
        return await self.repository.get_patient_plan(patient_id=patient_id)

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
        metadata = await self.repository.get_exercise_report_metadata(exercise_id=exercise_id, patient_id=patient_id)
        return ExerciseData(
            exercise_name=metadata.exercise_name,
            visit_type=metadata.visit_type,
            reps=metadata.reps,
            num_sets=metadata.num_sets,
            execution_status=metadata.execution_status,
            ex_video_url=metadata.ex_video_url,
            text_instructions=metadata.text_instructions,
        )

    async def post_exercise_report(self, exercise_id: str, patient_id: str, report: ExerciseReport) -> None:
        """Forward the patient report to the repository for insert.

        Args:
            exercise_id: Exercise identifier.
            patient_id: Patient identifier.
            report: Execution status and subjective feedback fields.

        Returns:
            None
        """
        return await self.repository.post_exercise_report(exercise_id=exercise_id, patient_id=patient_id, report=report)
