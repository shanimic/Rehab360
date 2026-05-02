from aiomysql import DictCursor

class WeeklyScheduleRepository:
    def __init__(self, db: DictCursor) -> None:
        self.cursor = db
        self.table_name = "registered_users"

    async def get_weekly_schedule(self, patient_id: str):
        await self.cursor.execute(
            query="""
                    SELECT e.exercise_id,reps,num_sets,time_duration,time_unit,e.exercise_name
            from plan_exercises pe, plans p, exercises e
            where 
            p.plan_id= pe.plan_id  
            and e.exercise_id= pe.exercise_id
            and p.session_id=pe.session_id
            and p.end_date >= curdate()
            and p.start_date <= curdate()
            and pe.session_id in 
            (select s.session_id
                from sessions s where s.patient_id =s%
                    and s.session_status = 'ACTIVE' );	
                    
                    """,
            args=(patient_id,)
        )
        rows = await self.cursor.fetchall()
        print(rows)
        # return [LoginResponse.model_validate(row) for row in rows] if rows else None
