from aiomysql import DictCursor

from app.models.profile.profile import ActivePlan, ProfileData


class ProfileRepository:
    def __init__(self, db: DictCursor) -> None:
        self.cursor = db

    async def get_profile_data(self, user_id: str) -> ProfileData | None:
        """Fetches personal profile info for any user role.

        Args:
            user_id: The user's ID.

        Returns:
            A ProfileData instance, or None if not found.
        """
        await self.cursor.execute(
            query="""
                SELECT last_name,
                       email,
                       phone,
                       birth_date,
                       license_number
                FROM registered_users
                WHERE user_id = %s
            """,
            args=(user_id,),
        )
        row = await self.cursor.fetchone()
        return ProfileData.model_validate(row) if row else None

    async def get_active_patient_plans(self, user_id: str) -> list[ActivePlan]:
        """Fetches active plans with per-plan completion % for a patient.

        Args:
            user_id: The patient's user ID.

        Returns:
            A list of ActivePlan instances.
        """
        await self.cursor.execute(
            query="""
                SELECT
                    p.plan_id,
                    p.goal,
                    s.visit_type AS category,
                    p.start_date,
                    p.end_date,
                    ROUND(
                        COALESCE(
                            (SELECT SUM(ec.num_exe_completed)
                             FROM exercise_completion ec
                             WHERE ec.plan_id = p.plan_id
                               AND ec.session_id = p.session_id),
                            0
                        ) / NULLIF(
                            (SELECT SUM(pe.reps * pe.num_sets * pe.time_duration *
                                        (CASE pe.time_unit WHEN 'Weekly' THEN 1 ELSE 7 END))
                             FROM plan_exercises pe
                             WHERE pe.plan_id = p.plan_id
                               AND pe.session_id = p.session_id)
                            * NULLIF(TIMESTAMPDIFF(WEEK, p.start_date, p.end_date), 0),
                            0
                        ) * 100,
                    1) AS completion_percent
                FROM plans p
                JOIN sessions s ON p.session_id = s.session_id
                WHERE s.patient_id = %s
                  AND s.session_status = 'ACTIVE'
            """,
            args=(user_id,),
        )
        rows = await self.cursor.fetchall()
        return [ActivePlan.model_validate(row) for row in rows]
