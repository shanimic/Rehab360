from aiomysql import DictCursor

from app.models.exercises.exercise import ExerciseReport, ExerciseReportMetadata
from app.models.patients.patient_exercises import DailyExerciseItem


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
        if metadata is None:
            raise ValueError(f"Exercise {exercise_id} not scheduled for patient {patient_id} today")

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
                metadata.num_exe_completed if report.execution_status else 0,
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
                FROM weekly_plans wp
                JOIN plan_exercises pe
                    ON wp.session_id = pe.session_id
                    AND wp.plan_id = pe.plan_id
                    AND wp.exercise_id = pe.exercise_id
                JOIN exercises e ON pe.exercise_id = e.exercise_id
                LEFT JOIN exercise_completion ec
                    ON ec.session_id = pe.session_id
                    AND ec.exercise_id = e.exercise_id
                    AND ec.execution_date = wp.exercise_date
                WHERE e.exercise_id = %s
                  AND wp.exercise_date = CURDATE()
                  AND pe.session_id IN (
                      SELECT s.session_id
                      FROM sessions s
                      WHERE s.patient_id = %s
                        AND s.session_status = 'ACTIVE'
                  );
                 """,
            args=(exercise_id, patient_id),
        )
        row = await self.cursor.fetchone()
        return ExerciseReportMetadata.model_validate(row) if row else None

    async def get_patient_plan(self, patient_id: str) -> list[DailyExerciseItem] | list:
        """Fetch today's exercises (both completed and pending) for the patient.

        Args:
            patient_id: Patient identifier (active sessions only).

        Returns:
            List of ``DailyExerciseItem`` for today's active session.
        """
        await self.cursor.execute(query="""
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
                        AND ec.execution_date = wp.exercise_date
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
        if not rows:
            return []
        return [DailyExerciseItem.model_validate(row) for row in rows]

    async def get_week_exercises(self, patient_id: str) -> list[dict]:
        """Fetch exercises for day+2 through day+6, including the exercise_date for grouping.

        Args:
            patient_id: Patient identifier (active sessions only).

        Returns:
            Raw dicts with exercise fields plus ``exercise_date``, ordered by date.
        """
        await self.cursor.execute(
            query="""
                SELECT
                    pe.exercise_id,
                    e.exercise_name,
                    e.visit_type,
                    pe.reps,
                    0 AS execution_status,
                    pe.num_sets,
                    e.text_instructions,
                    wp.exercise_date
                FROM weekly_plans wp
                JOIN plan_exercises pe
                    ON wp.session_id = pe.session_id
                    AND wp.plan_id = pe.plan_id
                    AND wp.exercise_id = pe.exercise_id
                JOIN exercises e ON pe.exercise_id = e.exercise_id
                WHERE wp.exercise_date BETWEEN DATE_ADD(CURDATE(), INTERVAL 2 DAY)
                                          AND DATE_ADD(CURDATE(), INTERVAL 6 DAY)
                  AND pe.session_id IN (
                      SELECT s.session_id
                      FROM sessions s
                      WHERE s.patient_id = %s AND s.session_status = 'ACTIVE'
                  )
                ORDER BY wp.exercise_date
            """,
            args=(patient_id,),
        )
        rows = await self.cursor.fetchall()
        return list(rows) if rows else []

    async def get_tommorow_exercises(self, patient_id: str) -> list[DailyExerciseItem] | list:
        """Fetch tomorrow's exercises for the patient.

        Args:
            patient_id: Patient identifier (active sessions only).

        Returns:
            List of ``DailyExerciseItem`` scheduled for tomorrow.
        """
        await self.cursor.execute(query="""
                    -- Part 1: Exercises scheduled for TOMORROW that are NOT yet completed
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
                        WHERE wp.exercise_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY) -- שינוי כאן
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

                        -- Part 2: Exercises scheduled for TOMORROW that ARE completed
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
                            AND ec.execution_date = wp.exercise_date
                        WHERE wp.exercise_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
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
        if not rows:
            return []
        return [DailyExerciseItem.model_validate(row) for row in rows]
