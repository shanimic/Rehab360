from aiomysql import DictCursor

from app.models.exercises.exercise import ExerciseReport, ExerciseReportMetadata, PatientPlanExercise


class ExerciseRepository:
    """Raw SQL for exercise metadata lookup and completion report inserts."""

    def __init__(self, db: DictCursor) -> None:
        """Store the async DictCursor used for all queries in this repository.

        Args:
            db: Dictionary cursor from the connection pool (FastAPI ``get_db`` dependency).
        """
        self.cursor = db

    async def post_exercise_report(
        self,
        exercise_id: str,
        patient_id: str,
        report: ExerciseReport,
    ) -> None:
        """Insert a completion row after resolving plan/session context from metadata.

        Args:
            exercise_id: Exercise identifier for the insert.
            patient_id: Patient identifier used when loading metadata.
            report: Patient-submitted execution and feedback fields.

        Returns:
            None
        """
        metadata = await self.get_exercise_report_metadata(exercise_id, patient_id)

        await self.cursor.execute(
            query="""
                INSERT INTO exercise_completion (
                    weekly_plan_id,
                    plan_id,
                    session_id,
                    exercise_id,
                    execution_date,
                    execution_status,
                    reason_for_non_performance,
                    pain_level,
                    effort_level,
                    request_for_change,
                    num_exe_completed)
                VALUES (%s, %s, %s, %s, CURDATE(), %s, %s, %s, %s, %s, %s)
            """,
            args=(
                metadata.weekly_plan_id,
                metadata.plan_id,
                metadata.session_id,
                exercise_id,
                report.execution_status,
                report.reason_for_non_performance,
                report.pain_level,
                report.effort_level,
                report.request_for_change,
                metadata.num_exe_completed,
            )
        )

    async def get_exercise_report_metadata(
        self, exercise_id: str, patient_id: str
    ) -> ExerciseReportMetadata | None:
        """Load today's exercise and completion context for the patient and exercise.

        Args:
            exercise_id: Exercise identifier.
            patient_id: Patient identifier (active sessions only).

        Returns:
            Validated metadata, or ``None`` when no matching row exists.
        """
        await self.cursor.execute(
            query="""
                SELECT e.exercise_name,
                       e.visit_type,
                       pe.reps,
                       ec.execution_status,
                       ec.execution_date,
                       ec.reason_for_non_performance,
                       ec.pain_level,
                       ec.effort_level,
                       ec.request_for_change,
                       pe.num_sets,
                       pe.reps * pe.num_sets AS num_exe_completed,
                       e.ex_video_url, 
                       e.text_instructions,
                       wp.session_id,
                       wp.weekly_plan_id,
                       wp.plan_id
                FROM weekly_plans wp , plan_exercises pe, exercises e,exercise_completion ec
                WHERE wp.session_id = pe.session_id AND
                      pe.exercise_id = e.exercise_id AND
                      e.exercise_id = %s AND
                      pe.session_id = ec.session_id AND
                      wp.exercise_date= CURDATE() AND
                      pe.session_id IN (
                          SELECT s.session_id
                          FROM sessions s WHERE s.patient_id = %s AND
                                s.session_status = 'ACTIVE' );
                 """,
            args=(exercise_id, patient_id),
        )
        row = await self.cursor.fetchone()
        return ExerciseReportMetadata.model_validate(row) if row else None

    async def get_patient_plan(self, patient_id: str):
        await self.cursor.execute(query="""
                select pe.exercise_id,e.exercise_name,e.visit_type,pe.reps,ec.execution_status,
                e.ex_video_url,e.text_instructions,wp.session_id,wp.weekly_plan_id,wp.plan_id
                from weekly_plans wp , plan_exercises pe, exercises e,exercise_completion ec
                where wp.session_id = pe.session_id
                and pe.exercise_id = e.exercise_id
                and pe.session_id = ec.session_id
                and wp.exercise_date= CURDATE()   
                and pe.session_id in 
                (select s.session_id
                    from sessions s where s.patient_id = %s 
                        and s.session_status = 'ACTIVE' );   
                  """,
            args=(patient_id,)
        )

        rows = await self.cursor.fetchall()
        return [PatientPlanExercise.model_validate(row) for row in rows]
