"""HTTP routes for single-exercise read and report submission."""

from aiomysql import DictCursor
from fastapi import APIRouter, Depends

from app.models.exercises.exercise import ExerciseData
from app.models.patients.patient_exercises import DailyExerciseItem
from app.dal.exercise_repository import ExerciseRepository
from app.db.session import get_db
from app.models.exercises.exercise import ExerciseReport
from app.services.exercise_services import ExerciseServices

exercise_router = APIRouter()


@exercise_router.get("/{patient_id}", tags=["Exercises"], response_model=list[DailyExerciseItem])
async def get_petient_exercises(patient_id: str, db: DictCursor = Depends(get_db)) -> list[DailyExerciseItem]:
    """Return all exercises in today's active plan for a patient.

    Args:
        patient_id: Identifier of the patient.

    Returns:
        List of exercises assigned to the patient's active session today.
    """
    exercise_repository = ExerciseRepository(db=db)
    exercise_service = ExerciseServices(repository=exercise_repository)
    return await exercise_service.get_patient_plan(patient_id=patient_id)

@exercise_router.get("/{exercise_id}/{patient_id}", tags=["Exercises"], response_model=ExerciseData)
async def get_exercise(exercise_id: str, patient_id: str, db: DictCursor = Depends(get_db)) -> ExerciseData:
    """Return today's exercise details for a patient.

    Args:
        exercise_id: Identifier of the exercise row.
        patient_id: Identifier of the patient (scoped to active sessions).

    Returns:
        Exercise presentation data (name, visit type, reps, media, instructions).

    Raises:
        AttributeError: If no exercise metadata row exists for the given identifiers.
    """
    exercise_repository = ExerciseRepository(db=db)
    exercise_service = ExerciseServices(repository=exercise_repository)
    return await exercise_service.get_exercise(exercise_id=exercise_id, patient_id=patient_id)


@exercise_router.post("/{exercise_id}/{patient_id}", tags=["Exercises"], response_model=None)
async def post_exercise_report(exercise_id: str, patient_id: str, report: ExerciseReport, db: DictCursor = Depends(get_db)) -> None:
    """Persist a patient report for an assigned exercise (completion, pain, effort).

    Args:
        exercise_id: Identifier of the exercise row.
        patient_id: Identifier of the patient.
        report: Report payload (execution status, optional reason, pain/effort, change request).

    Returns:
        None: HTTP 200 with empty body on success.
    """
    exercise_repository = ExerciseRepository(db=db)
    exercise_service = ExerciseServices(repository=exercise_repository)
    await exercise_service.post_exercise_report(exercise_id=exercise_id, patient_id=patient_id, report=report)
