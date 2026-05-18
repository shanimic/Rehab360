from aiomysql import DictCursor

from app.models.patient_details.patient_details import (
    CurrentPlanWithProgress,
    LatestVisitSummary,
    PatientBasicInfo,
)


class PatientDetailsRepository:
    """Data access layer for patient details page queries."""

    def __init__(self, db: DictCursor) -> None:
        self.cursor = db

    async def get_patient_details(self, patient_id: str) -> PatientBasicInfo | None:
        """Fetch basic profile info for a patient by ID.

        Args:
            patient_id: The patient's user ID.

        Returns:
            A PatientBasicInfo instance, or None if the patient does not exist.
        """
        await self.cursor.execute(
            query="""
                SELECT
                    ru.user_id,
                    ru.first_name,
                    ru.last_name,
                    ru.phone,
                    ru.birth_date,
                    ru.email
                FROM registered_users ru
                WHERE ru.user_id = %s
                  AND ru.user_role = 'PATIENT'
            """,
            args=(patient_id,),
        )
        row = await self.cursor.fetchone()
        return PatientBasicInfo.model_validate(row) if row else None

    async def get_latest_visit_summary(
        self, patient_id: str
    ) -> LatestVisitSummary | None:
        """Fetch the most recent active session for a patient.

        Args:
            patient_id: The patient's user ID.

        Returns:
            A LatestVisitSummary instance, or None if no active session exists.
        """
        await self.cursor.execute(
            query="""
                SELECT
                    s.session_id,
                    s.visit_date,
                    s.visit_time,
                    s.visit_type,
                    s.description,
                    CONCAT(t.first_name, ' ', t.last_name) AS therapist_name
                FROM sessions s
                JOIN registered_users t
                  ON t.user_id = s.therapist_id
                 AND t.user_role = s.therapist_role
                WHERE s.patient_id = %s
                  AND s.patient_role = 'PATIENT'
                  AND s.session_status = 'ACTIVE'
                ORDER BY
                    s.visit_date DESC,
                    s.visit_time DESC,
                    s.session_id DESC
                LIMIT 1
            """,
            args=(patient_id,),
        )
        row = await self.cursor.fetchone()
        return LatestVisitSummary.model_validate(row) if row else None

    async def get_current_plan_with_progress(
        self, patient_id: str, visit_type: str
    ) -> CurrentPlanWithProgress | None:
        """Fetch the current active plan with completion progress for a patient.

        Args:
            patient_id: The patient's user ID.
            visit_type: The plan type — 'PHYSIOTHERAPIST' or 'FITNESS'.

        Returns:
            A CurrentPlanWithProgress instance, or None if no active plan exists.
        """
        await self.cursor.execute(
            query="""
                SELECT
                    p.plan_id,
                    p.session_id,
                    s.medical_diagnosis,
                    p.start_date,
                    p.end_date,
                    COALESCE(
                        (
                            EXE_COMPLETED.EXECOMP /
                            (
                                NUM_EXE_PER_W.NEPW *
                                NUM_WEEKS.weeks_diff
                            )
                        ) * 100,
                        0
                    ) AS progress_percentage,
                    EXE_COMPLETED.last_progress_update
                FROM plans p
                JOIN sessions s
                  ON s.session_id = p.session_id

                CROSS JOIN (
                    SELECT
                        SUM(
                            pe.reps *
                            pe.num_sets *
                            pe.time_duration *
                            (CASE pe.time_unit WHEN 'Weekly' THEN 1 ELSE 7 END)
                        ) AS NEPW
                    FROM plan_exercises pe
                    JOIN sessions s2
                      ON pe.session_id = s2.session_id
                    WHERE s2.patient_id = %s
                      AND s2.patient_role = 'PATIENT'
                      AND s2.session_status = 'ACTIVE'
                      AND s2.visit_type = %s
                ) AS NUM_EXE_PER_W

                CROSS JOIN (
                    SELECT
                        TIMESTAMPDIFF(WEEK, p2.start_date, p2.end_date) AS weeks_diff
                    FROM plans p2
                    JOIN sessions s3
                      ON p2.session_id = s3.session_id
                    WHERE s3.patient_id = %s
                      AND s3.patient_role = 'PATIENT'
                      AND s3.session_status = 'ACTIVE'
                      AND s3.visit_type = %s
                    ORDER BY
                        s3.visit_date DESC,
                        s3.visit_time DESC,
                        s3.session_id DESC
                    LIMIT 1
                ) AS NUM_WEEKS

                CROSS JOIN (
                    SELECT
                        SUM(ec.num_exe_completed) AS EXECOMP,
                        MAX(ec.execution_date) AS last_progress_update
                    FROM exercise_completion ec
                    JOIN sessions s4
                      ON ec.session_id = s4.session_id
                    WHERE s4.patient_id = %s
                      AND s4.patient_role = 'PATIENT'
                      AND ec.execution_status = 1
                      AND s4.session_status = 'ACTIVE'
                      AND s4.visit_type = %s
                ) AS EXE_COMPLETED

                WHERE s.patient_id = %s
                  AND s.patient_role = 'PATIENT'
                  AND s.session_status = 'ACTIVE'
                  AND s.visit_type = %s

                ORDER BY
                    s.visit_date DESC,
                    s.visit_time DESC,
                    s.session_id DESC

                LIMIT 1
            """,
            args=(
                patient_id, visit_type,
                patient_id, visit_type,
                patient_id, visit_type,
                patient_id, visit_type,
            ),
        )
        row = await self.cursor.fetchone()
        return CurrentPlanWithProgress.model_validate(row) if row else None
