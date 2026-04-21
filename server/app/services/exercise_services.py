from app.dal.exercise_repository import ExerciseRepository


class ExerciseServices:
    def __init__(self, repository: ExerciseRepository):
        self.repository = repository

    async def save_exercise_report(self, exe_id: str, report_data: dict):
        # Here you would implement the logic to save the exercise report using the repository
        # For example:
        # await self.repository.save_report(exe_id, report_data)
        pass

    async def _get_report_metadata(self, exe_id: str, patient_id: str):
        await self.cursor.execute(
            query="""
                    SELECT pe.exercise_id, 
                           e.exercise_name,  
                           e.visit_type,
                           pe.reps,
                           ec.execution_status,
                           ec.execution_date
                    FROM weekly_plans wp , 
                         plan_exercises pe, 
                         exercises e,
                         sessions s,
                         exercise_completion ec
                    WHERE wp.session_id = pe.session_id AND 
                          pe.exercise_id = e.exercise_id AND
                          pe.session_id = s.session_id AND
                          pe.session_id = ec.session_id AND
                          wp.exercise_date= CURDATE() AND
                          pe.session_id IN ( 
                                           SELECT s.session_id
                                           FROM sessions s 
                                           WHERE s.patient_id = %s AND
                                                 s.session_status = 'ACTIVE' );
                    """,
            args=(patient_id,),
        )
        rows = await self.cursor.fetchall()