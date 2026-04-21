from fastapi import APIRouter, Depends

from app.db.session import get_db
from app.dal.exercise_repository import ExerciseRepository
from app.services.exercise_services import ExerciseServices

exercise_router = APIRouter()


@exercise_router.post("/{exe_id}", tags=["Profile"])
async def saveExerciseReport(exe_id: str, report_data: dict, db=Depends(get_db)):
    exercise_repository = ExerciseRepository(db=db)
    exercise_service = ExerciseServices(repository=exercise_repository)
    return await exercise_service.save_exercise_report(exe_id, report_data)
