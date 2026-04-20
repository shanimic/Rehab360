from app.dal.patient_repository import PatientRepository
from app.models.patients.patient_exercises import DailyCompletion, PatientHomeData


class PatientServices:
    def __init__(self, repository: PatientRepository) -> None:
        self.repository = repository

    async def get_patient_home_data(
        self, patient_id: str
    ) -> PatientHomeData:
        daily_exercises = await self.repository.get_patient_total_daily_exercises(patient_id)
        weekly_completion = await self.repository.get_weekly_completion(patient_id)
        fitness_percentage = await self.repository.get_patient_fitness_percentage(patient_id)
        physiotherapist_percentage = await self.repository.get_physiotherapist_percentage(patient_id)
        daily_completions = DailyCompletion(completed_sum=sum(1 for exercise in daily_exercises if exercise.execution_status),
                                            total=len(daily_exercises))

        return PatientHomeData(
            daily_exercises=daily_exercises,
            weekly_completion=weekly_completion,
            fitness_percentage=fitness_percentage,
            physiotherapist_percentage=physiotherapist_percentage,
            daily_completions=daily_completions,
        )
