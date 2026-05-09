from aiomysql import DictCursor

from app.models.treatment_plan.treatment_plan import (
    CreateTreatmentPlanRequest,
    CreateTreatmentPlanResponse,
    PhysiotherapyExerciseItem,
    TreatmentPlanContext,
    TreatmentPlanDetailsResponse,
    TreatmentPlanExerciseItem,
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

    async def get_exercises_by_visit_type(
        self, visit_type: str
    ) -> list[PhysiotherapyExerciseItem]:
        """Fetch all exercises that belong to the given visit type.

        Args:
            visit_type: The visit type to filter by (e.g. 'PHYSIOTHERAPIST' or 'FITNESS').

        Returns:
            A list of PhysiotherapyExerciseItem instances ordered by name.
        """
        await self.cursor.execute(
            query="""
                SELECT
                    exercise_id,
                    exercise_name
                FROM exercises
                WHERE visit_type = %s
                ORDER BY exercise_name ASC
            """,
            args=(visit_type,),
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

    async def get_valid_exercise_ids(
        self, exercise_ids: list[int], visit_type: str
    ) -> list[int]:
        """Return the subset of the given IDs that match the specified visit type.

        Args:
            exercise_ids: List of exercise IDs to validate.
            visit_type: The visit type the exercises must belong to.

        Returns:
            A list of exercise_id values that exist and match the given visit_type.
        """
        if not exercise_ids:
            return []
        placeholders = ",".join(["%s"] * len(exercise_ids))
        await self.cursor.execute(
            query=f"""
                SELECT exercise_id
                FROM exercises
                WHERE exercise_id IN ({placeholders})
                  AND visit_type = %s
            """,
            args=(*exercise_ids, visit_type),
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

    async def get_treatment_plan_by_plan_id(
        self, plan_id: int
    ) -> TreatmentPlanDetailsResponse | None:
        """Fetch treatment plan header for the given plan.

        Args:
            plan_id: The unique identifier of the plan.

        Returns:
            A TreatmentPlanDetailsResponse (with empty exercises) if an active plan
            exists, otherwise None.
        """
        await self.cursor.execute(
            query="""
                SELECT
                    p.plan_id,
                    p.session_id,
                    s.medical_diagnosis,
                    s.visit_type,
                    p.goal,
                    p.start_date,
                    p.end_date,
                    p.notes
                FROM plans p
                JOIN sessions s
                    ON p.session_id = s.session_id
                WHERE p.plan_id = %s
                  AND s.session_status = 'ACTIVE'
            """,
            args=(plan_id,),
        )
        row = await self.cursor.fetchone()
        if not row:
            return None
        return TreatmentPlanDetailsResponse(**row, exercises=[])

    async def get_exercises_by_plan(
        self, plan_id: int, session_id: int
    ) -> list[TreatmentPlanExerciseItem]:
        """Fetch all exercises belonging to the given plan, ordered by name.

        Args:
            plan_id: The unique identifier of the plan.
            session_id: The session the plan belongs to.

        Returns:
            A list of TreatmentPlanExerciseItem instances ordered by exercise name.
        """
        await self.cursor.execute(
            query="""
                SELECT
                    pe.exercise_id,
                    e.exercise_name,
                    pe.reps,
                    pe.num_sets,
                    pe.weight,
                    pe.time_duration,
                    pe.time_unit,
                    pe.description
                FROM plan_exercises pe
                JOIN exercises e
                    ON pe.exercise_id = e.exercise_id
                WHERE pe.plan_id   = %s
                  AND pe.session_id = %s
                ORDER BY e.exercise_name ASC
            """,
            args=(plan_id, session_id),
        )
        rows = await self.cursor.fetchall()
        return [TreatmentPlanExerciseItem.model_validate(row) for row in rows]
