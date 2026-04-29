from aiomysql import DictCursor

from app.models.patients.visit_type import VisitType
from app.models.visit_summary.visit_summary import (
    CreatePlanRequest,
    CreatePlanResponse,
    CreateVisitSummaryRequest,
    CreateVisitSummaryResponse,
    PatientDetails,
    SessionListItem,
    VisitSummaryDetails,
)


class VisitSummaryRepository:
    """Data access layer for visit summary operations."""

    def __init__(self, db: DictCursor) -> None:
        self.cursor = db

    async def get_patient_details(self, patient_id: str) -> PatientDetails | None:
        """Fetch patient details by patient ID.

        Args:
            patient_id: The unique identifier of the patient.

        Returns:
            A PatientDetails instance if found, otherwise None.
        """
        await self.cursor.execute(
            query="""
                SELECT
                    u.user_id AS patient_id,
                    u.first_name AS patient_first_name,
                    u.last_name AS patient_last_name,
                    u.phone,
                    u.birth_date,
                    u.email,
                    p.plan_id
                FROM registered_users u
                LEFT JOIN sessions s
                    ON s.patient_id = u.user_id
                    AND s.session_status = 'ACTIVE'
                LEFT JOIN plans p
                    ON p.session_id = s.session_id
                WHERE u.user_id = %s
                  AND u.user_role = 'PATIENT'
                ORDER BY p.plan_id DESC
                LIMIT 1
            """,
            args=(patient_id,),
        )
        row = await self.cursor.fetchone()
        return PatientDetails.model_validate(row) if row else None

    async def create_visit_summary(
        self,
        request: CreateVisitSummaryRequest,
        visit_type: VisitType,
    ) -> CreateVisitSummaryResponse:
        """Insert a new visit summary and return its generated session ID.

        Args:
            request: The visit summary data from the caller.
            visit_type: The derived visit type based on the therapist's role.

        Returns:
            A CreateVisitSummaryResponse containing the new session_id.
        """
        await self.cursor.execute(
            query="""
                INSERT INTO sessions (
                    visit_date,
                    visit_time,
                    visit_type,
                    treatment_area,
                    medical_diagnosis,
                    description,
                    recommendations,
                    patient_id,
                    patient_role,
                    therapist_id,
                    therapist_role,
                    session_status
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'PATIENT', %s, %s, 'ACTIVE')
            """,
            args=(
                request.visit_date,
                request.visit_time,
                visit_type.value,
                request.treatment_area,
                request.medical_diagnosis,
                request.description,
                request.recommendations,
                request.patient_id,
                request.therapist_id,
                request.therapist_role.value,
            ),
        )
        await self.cursor.execute("SELECT LAST_INSERT_ID() AS session_id")
        row = await self.cursor.fetchone()
        return CreateVisitSummaryResponse.model_validate(row)

    async def get_sessions_by_patient(self, patient_id: str) -> list[SessionListItem]:
        """Fetch all active sessions for a patient, newest first.

        Args:
            patient_id: The unique identifier of the patient.

        Returns:
            A list of SessionListItem instances ordered by date descending.
        """
        await self.cursor.execute(
            query="""
                SELECT
                    s.session_id,
                    s.visit_date,
                    s.visit_time,
                    s.visit_type,
                    s.treatment_area,
                    s.medical_diagnosis,
                    s.description,
                    u_therapist.first_name AS therapist_first_name,
                    u_therapist.last_name  AS therapist_last_name
                FROM sessions s
                JOIN registered_users u_therapist
                    ON s.therapist_id   = u_therapist.user_id
                   AND s.therapist_role = u_therapist.user_role
                WHERE s.patient_id     = %s
                  AND s.session_status = 'ACTIVE'
                ORDER BY s.visit_date DESC, s.visit_time DESC
            """,
            args=(patient_id,),
        )
        rows = await self.cursor.fetchall()
        return [SessionListItem.model_validate(row) for row in rows]

    async def get_visit_summary_by_session_id(
        self, session_id: int
    ) -> VisitSummaryDetails | None:
        """Fetch full visit summary details by session ID.

        Args:
            session_id: The unique identifier of the session.

        Returns:
            A VisitSummaryDetails instance if found, otherwise None.
        """
        await self.cursor.execute(
            query="""
                SELECT
                    u_patient.user_id        AS patient_id,
                    u_patient.first_name     AS patient_first_name,
                    u_patient.last_name      AS patient_last_name,
                    u_patient.phone,
                    u_patient.birth_date,
                    u_patient.email,

                    s.session_id,
                    s.visit_date,
                    s.visit_time,
                    s.visit_type,
                    s.treatment_area,
                    s.medical_diagnosis,
                    s.description,
                    s.recommendations,

                    u_therapist.first_name   AS therapist_first_name,
                    u_therapist.last_name    AS therapist_last_name,
                    s.therapist_role,

                    p.plan_id

                FROM sessions s

                JOIN registered_users u_patient
                    ON s.patient_id   = u_patient.user_id
                   AND s.patient_role = u_patient.user_role

                JOIN registered_users u_therapist
                    ON s.therapist_id   = u_therapist.user_id
                   AND s.therapist_role = u_therapist.user_role

                LEFT JOIN plans p
                    ON s.session_id = p.session_id

                WHERE s.session_id = %s
            """,
            args=(session_id,),
        )
        row = await self.cursor.fetchone()
        return VisitSummaryDetails.model_validate(row) if row else None

    async def create_plan(self, request: CreatePlanRequest) -> CreatePlanResponse:
        """Insert a new treatment plan linked to a session and return its generated plan_id.

        Args:
            request: The plan data including the session_id that links it to a visit summary.

        Returns:
            A CreatePlanResponse containing the new plan_id and the linked session_id.
        """
        await self.cursor.execute(
            query="""
                INSERT INTO plans (session_id, goal, start_date, end_date)
                VALUES (%s, %s, %s, %s)
            """,
            args=(
                request.session_id,
                request.goal,
                request.start_date,
                request.end_date,
            ),
        )
        await self.cursor.execute(
            "SELECT LAST_INSERT_ID() AS plan_id, %s AS session_id",
            args=(request.session_id,),
        )
        row = await self.cursor.fetchone()
        return CreatePlanResponse.model_validate(row)
