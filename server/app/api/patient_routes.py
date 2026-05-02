from fastapi import APIRouter, Depends
from app.dal.patient_repository import PatientRepository
from app.db.session import get_db
from app.services.patient_services import PatientServices
from app.models.patients.patient_exercises import PatientHomeData, SaveWeeklyScheduleRequest, WeeklyScheduleItem

patient_router = APIRouter()

@patient_router.get("/home/{patient_id}", tags=["Patient"], response_model=PatientHomeData)
async def get_patient(patient_id: str, db=Depends(get_db)):
    patient_repository = PatientRepository(db=db)
    patient_service = PatientServices(repository=patient_repository)

    return await patient_service.get_patient_home_data(patient_id)

@patient_router.get("/weekly-schedule/{patient_id}", tags=["Patient"], response_model=list[WeeklyScheduleItem])
async def get_weekly_schedule(patient_id: str, db=Depends(get_db)):
    patient_repository = PatientRepository(db=db)
    patient_service = PatientServices(repository=patient_repository)

    return await patient_service.get_weekly_schedule(patient_id)

@patient_router.post("/weekly-schedule/{patient_id}", tags=["Patient"])
async def save_weekly_schedule(patient_id: str, body: SaveWeeklyScheduleRequest, db=Depends(get_db)):
    patient_repository = PatientRepository(db=db)
    patient_service = PatientServices(repository=patient_repository)

    await patient_service.save_weekly_schedule(patient_id, body)
