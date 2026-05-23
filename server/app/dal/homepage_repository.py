from aiomysql import DictCursor

from app.models.homepage.homepage import AllPatientItem


class HomepageRepository:
    """Data access layer for therapist homepage operations."""

    def __init__(self, db: DictCursor) -> None:
        self.cursor = db

    async def get_home_patients(
        self, therapist_id: str, therapist_role: str, visit_type: str
    ) -> list[dict]:
        """Fetch patient rows for the therapist's homepage.

        Returns the most recent ACTIVE session per patient for the given
        therapist and visit type, ordered newest first. Only sessions with
        status ACTIVE are considered — PENDING_PLAN drafts and NOT ACTIVE
        (superseded) sessions are both excluded from the result and from
        the latest-date subquery.

        Args:
            therapist_id: The unique identifier of the logged-in therapist.
            therapist_role: The role value stored in the sessions table.
            visit_type: The visit type value derived from the therapist role.

        Returns:
            A list of dicts with patient_id, first_name, last_name, and
            medical_diagnosis.
        """
        await self.cursor.execute(
            query="""
                SELECT
                    s.patient_id,
                    ru.first_name,
                    ru.last_name,
                    s.medical_diagnosis
                FROM sessions s
                JOIN registered_users ru
                    ON ru.user_id   = s.patient_id
                   AND ru.user_role = s.patient_role
                WHERE s.therapist_id     = %s
                  AND s.therapist_role   = %s
                  AND s.visit_type       = %s
                  AND s.patient_role     = 'PATIENT'
                  AND s.session_status   = 'ACTIVE'
                  AND CONCAT(s.visit_date, ' ', s.visit_time) = (
                      SELECT MAX(CONCAT(s2.visit_date, ' ', s2.visit_time))
                      FROM sessions s2
                      WHERE s2.patient_id     = s.patient_id
                        AND s2.patient_role   = 'PATIENT'
                        AND s2.therapist_id   = %s
                        AND s2.therapist_role = %s
                        AND s2.visit_type     = %s
                        AND s2.session_status = 'ACTIVE'
                  )
                ORDER BY
                    s.visit_date DESC,
                    s.visit_time DESC
            """,
            args=(
                therapist_id,
                therapist_role,
                visit_type,
                therapist_id,
                therapist_role,
                visit_type,
            ),
        )
        rows = await self.cursor.fetchall()
        return rows if rows else []

    async def get_patient_progress(
        self, patient_id: str, visit_type: str
    ) -> dict:
        """Fetch the progress percentage and last update date for a patient.

        Returns 0.0 for progress_percentage and None for last_progress_update
        when the patient has no active session or no completed exercises.

        Args:
            patient_id: The unique identifier of the patient.
            visit_type: The visit type value (e.g. 'PHYSIOTHERAPIST', 'FITNESS').

        Returns:
            A dict with ``progress_percentage`` (float) and
            ``last_progress_update`` (datetime.date or None).
        """
        await self.cursor.execute(
            query="""
                SELECT
                    (EXE_COMPLETED.EXECOMP / (NUM_EXE_PER_W.NEPW * NUM_WEEKS.weeks_diff)) * 100
                    AS progress_percentage,
                    EXE_COMPLETED.last_progress_update
                FROM
                (
                    SELECT
                        SUM(
                            pe.reps * pe.num_sets * pe.time_duration *
                            (CASE pe.time_unit WHEN 'Weekly' THEN 1 ELSE 7 END)
                        ) AS NEPW
                    FROM plan_exercises pe, sessions s
                    WHERE pe.session_id      = s.session_id
                      AND s.patient_id       = %s
                      AND s.session_status   = 'ACTIVE'
                      AND s.visit_type       = %s
                ) AS NUM_EXE_PER_W,

                (
                    SELECT
                        TIMESTAMPDIFF(WEEK, p.start_date, p.end_date) AS weeks_diff
                    FROM plans p, sessions s
                    WHERE p.session_id     = s.session_id
                      AND s.patient_id     = %s
                      AND s.session_status = 'ACTIVE'
                      AND s.visit_type     = %s
                ) AS NUM_WEEKS,

                (
                    SELECT
                        SUM(ec.num_exe_completed) AS EXECOMP,
                        MAX(ec.execution_date)    AS last_progress_update
                    FROM exercise_completion ec, sessions s
                    WHERE ec.session_id      = s.session_id
                      AND s.patient_id       = %s
                      AND ec.execution_status = 1
                      AND s.session_status   = 'ACTIVE'
                      AND s.visit_type       = %s
                ) AS EXE_COMPLETED
            """,
            args=(
                patient_id, visit_type,
                patient_id, visit_type,
                patient_id, visit_type,
            ),
        )
        row = await self.cursor.fetchone()
        if not row:
            return {"progress_percentage": 0.0, "last_progress_update": None}
        percentage = row.get("progress_percentage")
        return {
            "progress_percentage": float(percentage) if percentage is not None else 0.0,
            "last_progress_update": row.get("last_progress_update"),
        }

    async def get_all_patients(self) -> list[AllPatientItem]:
        """Fetch all patients ordered alphabetically.

        Returns:
            A list of AllPatientItem instances.
        """
        await self.cursor.execute(
            query="""
                SELECT
                    user_id    AS patient_id,
                    first_name,
                    last_name
                FROM registered_users
                WHERE user_role = 'PATIENT'
                ORDER BY first_name ASC, last_name ASC
            """,
        )
        rows = await self.cursor.fetchall()
        return [AllPatientItem.model_validate(row) for row in rows] if rows else []
