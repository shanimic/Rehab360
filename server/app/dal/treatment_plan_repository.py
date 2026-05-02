from aiomysql import DictCursor

from app.models.treatment_plan.treatment_plan import (
    CreateTreatmentPlanRequest,
    CreateTreatmentPlanResponse,
    PhysiotherapyExerciseItem,
    TreatmentPlanContext,
)


class TreatmentPlanRepository:
    """Data access layer for treatment plan operations."""

    def __init__(self, db: DictCursor) -> None:
        self.cursor = db

    async def get_treatment_plan_context(
        self, session_id: int
    ) -> TreatmentPlanContext | None:
        """Fetch session context required for the create-treatment-plan page.

        Args:
            session_id: The unique identifier of the session.

        Returns:
            A TreatmentPlanContext instance if the session is active, otherwise None.
        """
        await self.cursor.execute(
            query="""
                SELECT
                    session_id,
                    medical_diagnosis,
                    visit_type
                FROM sessions
                WHERE session_id     = %s
                  AND session_status = 'ACTIVE'
            """,
            args=(session_id,),
        )
        row = await self.cursor.fetchone()
        return TreatmentPlanContext.model_validate(row) if row else None

    async def get_physiotherapy_exercises(self) -> list[PhysiotherapyExerciseItem]:
        """Fetch all exercises that belong to the PHYSIOTHERAPIST visit type.

        Returns:
            A list of PhysiotherapyExerciseItem instances ordered by name.
        """
        await self.cursor.execute(
            query="""
                SELECT
                    exercise_id,
                    exercise_name
                FROM exercises
                WHERE visit_type = 'PHYSIOTHERAPIST'
                ORDER BY exercise_name ASC
            """,
        )
        rows = await self.cursor.fetchall()
        return [PhysiotherapyExerciseItem.model_validate(row) for row in rows]

    async def plan_exists(self, session_id: int) -> bool:
        """Check whether a treatment plan already exists for the given session.

        Args:
            session_id: The unique identifier of the session.

        Returns:
            True if a plan row exists, False otherwise.
        """
        await self.cursor.execute(
            query="""
                SELECT plan_id
                FROM plans
                WHERE session_id = %s
                LIMIT 1
            """,
            args=(session_id,),
        )
        row = await self.cursor.fetchone()
        return row is not None

    async def get_valid_physiotherapy_exercise_ids(
        self, exercise_ids: list[int]
    ) -> list[int]:
        """Return the subset of the given IDs that are PHYSIOTHERAPIST exercises.

        Args:
            exercise_ids: List of exercise IDs to validate.

        Returns:
            A list of exercise_id values that exist and have visit_type PHYSIOTHERAPIST.
        """
        if not exercise_ids:
            return []
        placeholders = ",".join(["%s"] * len(exercise_ids))
        await self.cursor.execute(
            query=f"""
                SELECT exercise_id
                FROM exercises
                WHERE exercise_id IN ({placeholders})
                  AND visit_type = 'PHYSIOTHERAPIST'
            """,
            args=tuple(exercise_ids),
        )
        rows = await self.cursor.fetchall()
        return [row["exercise_id"] for row in rows]

    async def create_treatment_plan(
        self,
        session_id: int,
        request: CreateTreatmentPlanRequest,
    ) -> CreateTreatmentPlanResponse:
        """Insert a treatment plan and its exercises, then return the new plan_id.

        Args:
            session_id: The session this plan belongs to (from the URL path).
            request: The plan payload including goal, dates, notes, and exercises.

        Returns:
            A CreateTreatmentPlanResponse containing the new plan_id and session_id.
        """
        await self.cursor.execute(
            query="""
                INSERT INTO plans (session_id, goal, start_date, end_date, notes)
                VALUES (%s, %s, %s, %s, %s)
            """,
            args=(
                session_id,
                request.goal,
                request.start_date,
                request.end_date,
                request.notes,
            ),
        )
        await self.cursor.execute("SELECT LAST_INSERT_ID() AS plan_id")
        row = await self.cursor.fetchone()
        plan_id: int = row["plan_id"]

        for exercise in request.exercises:
            await self.cursor.execute(
                query="""
                    INSERT INTO plan_exercises (
                        plan_id,
                        session_id,
                        exercise_id,
                        reps,
                        num_sets,
                        weight,
                        time_duration,
                        time_unit,
                        description
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                args=(
                    plan_id,
                    session_id,
                    exercise.exercise_id,
                    exercise.reps,
                    exercise.num_sets,
                    exercise.weight,
                    exercise.time_duration,
                    exercise.time_unit,
                    exercise.description,
                ),
            )

        return CreateTreatmentPlanResponse(plan_id=plan_id, session_id=session_id)
