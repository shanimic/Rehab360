
from aiomysql import DictCursor
from app.models.patients.patient_exercises import (
    DailyExerciseItem,
    SaveWeeklyScheduleRequest,
    WeeklyCompletion,
    WeeklyScheduleItem,
)


class PatientRepository:
    def __init__(self, db: DictCursor) -> None:
        self.cursor = db

    async def get_patient_total_daily_exercises(self, patient_id: str) -> list[DailyExerciseItem]:
        await self.cursor.execute(

            query="""
                    -- Part 1: Exercises scheduled for today that are NOT yet completed
                    SELECT
                        pe.exercise_id,
                        e.exercise_name,
                        e.visit_type,
                        pe.reps,
                        0 as execution_status,
                        pe.num_sets,
                        e.text_instructions
                    FROM weekly_plans wp
                    JOIN plan_exercises pe ON wp.session_id = pe.session_id
                        AND wp.plan_id = pe.plan_id
                        AND wp.exercise_id = pe.exercise_id
                    JOIN exercises e ON pe.exercise_id = e.exercise_id
                    WHERE wp.exercise_date = CURDATE()
                    AND pe.session_id IN (
                        SELECT s.session_id
                        FROM sessions s
                        WHERE s.patient_id = %s AND s.session_status = 'ACTIVE'
                    )
                    AND NOT EXISTS (
                        SELECT 1
                        FROM exercise_completion ec
                        WHERE ec.exercise_id = e.exercise_id
                        AND ec.session_id = wp.session_id
                        AND ec.execution_date = wp.exercise_date
                        AND ec.execution_status = 1
                    )

                    UNION

                    -- Part 2: Exercises scheduled for today that ARE completed
                    SELECT
                        pe.exercise_id,
                        e.exercise_name,
                        e.visit_type,
                        pe.reps,
                        1 as execution_status,
                        pe.num_sets,
                        e.text_instructions
                    FROM weekly_plans wp
                    JOIN plan_exercises pe ON wp.session_id = pe.session_id
                        AND wp.plan_id = pe.plan_id
                        AND wp.exercise_id = pe.exercise_id
                    JOIN exercises e ON pe.exercise_id = e.exercise_id
                    JOIN exercise_completion ec ON ec.session_id = pe.session_id
                        AND ec.exercise_id = pe.exercise_id
                        AND ec.plan_id = wp.plan_id
                    WHERE wp.exercise_date = CURDATE()
                    AND ec.execution_status = 1
                    AND pe.session_id IN (
                        SELECT s.session_id
                        FROM sessions s
                        WHERE s.patient_id = %s AND s.session_status = 'ACTIVE'
                    )
                """,
            args=(patient_id, patient_id),
        )
        rows = await self.cursor.fetchall()
        return [DailyExerciseItem.model_validate(row) for row in rows]

    async def get_weekly_completion(self, patient_id: str) -> list[WeeklyCompletion]:
        await self.cursor.execute(
            query="""
                    SELECT EXE_COMP_WEEK.EXECOMP , 
                        EXE_TODO_WEEK.EXETDW
                    FROM (
                            SELECT COUNT(*) AS EXECOMP 
                            FROM exercise_completion ec,
                            sessions s
                            WHERE ec.session_id = s.session_id AND 
                                s.patient_id = %s AND
                                s.session_status = 'ACTIVE' AND
                                ec.execution_date >= 
                                (SELECT DATE_SUB(CURDATE(), INTERVAL DAYOFWEEK(CURDATE()) - 1 DAY) AS start_of_week)) 
                            as EXE_COMP_WEEK,
                            (select sum( pe.time_duration * (case pe.time_unit when'Weekly'then 1 else 7 end )) as EXETDW
                            FROM plan_exercises pe,sessions s
                            WHERE pe.session_id = s.session_id AND 
                                s.patient_id = %s AND
                                s.session_status = 'ACTIVE') as EXE_TODO_WEEK;
                    """,
            args=(patient_id, patient_id),
            )
        row = await self.cursor.fetchone()
        return WeeklyCompletion.model_validate(row) if row else None

    async def get_patient_fitness_percentage(self, patient_id: str) -> float:
        await self.cursor.execute(
            query="""
                SELECT (EXE_COMPLETED.EXECOMP / (NUM_EXE_PER_W.NEPW * NUM_WEEKS.weeks_diff)) * 100 as FITNESS_PERCENTAGE
                FROM (
                    SELECT sum( pe.reps * pe.num_sets * pe.time_duration * (case pe.time_unit when'Weekly'then 1 else 7 end )) as NEPW
                    FROM plan_exercises pe,sessions s
                    WHERE pe.session_id = s.session_id AND s.patient_id = %s
                    AND s.session_status = 'ACTIVE'
                    AND s.visit_type = 'FITNESS'
                    ) as NUM_EXE_PER_W, (
                    SELECT TIMESTAMPDIFF(WEEK, p.start_date , p.end_date) AS weeks_diff 
                    FROM plans p, 
                         sessions s
                    WHERE p.session_id = s.session_id AND 
                          s.patient_id = %s AND
                          s.session_status = 'ACTIVE' AND
                          s.visit_type = 'FITNESS') as NUM_WEEKS,
                    (SELECT sum(ec.num_exe_completed) as EXECOMP FROM exercise_completion ec,sessions s
                    WHERE ec.session_id = s.session_id AND 
                          s.patient_id = %s AND
                          s.session_status = 'ACTIVE' AND
                          ec.execution_status = 1 AND
                          s.visit_type = 'FITNESS') as EXE_COMPLETED ;
                """,
            args=(patient_id, patient_id, patient_id),
        )
        row = await self.cursor.fetchone()

        # 1. Check if the row exists at all
        if not row:
            return 0

        # 2. Extract the value
        percentage = row.get("FITNESS_PERCENTAGE")

        # 3. If the value is None (SQL NULL), return 0, otherwise return the value
        return percentage if percentage is not None else 0

    async def get_physiotherapist_percentage(self, patient_id: str) -> float:
        await self.cursor.execute(
            query="""
                select (EXE_COMPLETED.EXECOMP / (NUM_EXE_PER_W.NEPW * NUM_WEEKS.weeks_diff)) * 100 AS PHYSIOTHERAPIST_PERCENTAGE
                from 
                (select sum( pe.reps * pe.num_sets * pe.time_duration * 
                (case pe.time_unit when'Weekly'then 1 else 7 end )) as NEPW
                from plan_exercises pe,sessions s 
                where pe.session_id = s.session_id and s.patient_id = %s
                and s.session_status = 'ACTIVE'
                and s.visit_type = 'PHYSIOTHERAPIST') as NUM_EXE_PER_W,
                (SELECT TIMESTAMPDIFF(WEEK, p.start_date , p.end_date) AS weeks_diff 
                from plans p, sessions s
                where p.session_id = s.session_id and s.patient_id = %s
                and s.session_status = 'ACTIVE'
                and s.visit_type = 'PHYSIOTHERAPIST') as NUM_WEEKS,
                (select sum(ec.num_exe_completed) as EXECOMP from exercise_completion ec,sessions s
                where ec.session_id = s.session_id and s.patient_id = %s
                and ec.execution_status = 1
                and s.session_status = 'ACTIVE'
                and s.visit_type = 'PHYSIOTHERAPIST') as EXE_COMPLETED  ;
                """,
            args=(patient_id, patient_id, patient_id),
        )
        row = await self.cursor.fetchone()

        # 1. Check if the row exists at all
        if not row:
            return 0

        # 2. Extract the value
        percentage = row.get("PHYSIOTHERAPIST_PERCENTAGE")

        # 3. If the value is None (SQL NULL), return 0, otherwise return the value
        return percentage if percentage is not None else 0

    async def get_weekly_schedule(self, patient_id: str) -> list[WeeklyScheduleItem]:
        """Retrieve all active plan exercises within the current date range.

        Args:
            patient_id: The unique identifier of the patient.

        Returns:
            A list of WeeklyScheduleItem instances for the patient's active plan.
        """
        await self.cursor.execute(
            query="""
                    SELECT e.exercise_id,
                           reps,
                           num_sets,
                           pe.weight,
                           time_duration,
                           time_unit,
                           e.exercise_name,
                           e.visit_type,
                           pe.session_id,
                           p.plan_id
                    FROM plan_exercises pe,
                         plans p,
                         exercises e
                    WHERE p.plan_id = pe.plan_id
                      AND e.exercise_id = pe.exercise_id
                      AND p.session_id = pe.session_id
                      AND p.end_date >= CURDATE()
                      AND p.start_date <= CURDATE()
                      AND pe.session_id IN (
                          SELECT s.session_id
                          FROM sessions s
                          WHERE s.patient_id = %s
                            AND s.session_status = 'ACTIVE')
                    """,
            args=(patient_id,),
        )
        rows = await self.cursor.fetchall()
        return [WeeklyScheduleItem.model_validate(row) for row in rows]


    async def save_weekly_schedule(self, _patient_id: str, body: SaveWeeklyScheduleRequest) -> None:
        """Save the patient's weekly exercise schedule.

        Args:
            patient_id: The unique identifier of the patient.
            body: The save-schedule request containing reminders flag and schedule entries.

        Returns:
            None
        """
        for item in body.schedule:
            await self.cursor.execute(
                query="""
                        INSERT INTO weekly_plans (plan_id, session_id, exercise_id,
                                                  reminder_time, notification_enabled,
                                                  exercise_date)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE
                            reminder_time = VALUES(reminder_time),
                            notification_enabled = VALUES(notification_enabled)
                        """,
                args=(
                    item.plan_id,
                    item.session_id,
                    item.exercise_id,
                    f"{item.reminder_date} {item.reminder_time}:00"
                    if item.reminder_date and item.reminder_time
                    else "1970-01-01 00:00:00",
                    body.reminders_enabled,
                    item.reminder_date
                    if item.reminder_date else "1970-01-01"
                                  ),
            )
