from aiomysql import DictCursor

from app.models.patients.visit_type import VisitType
from app.models.visit_summary.visit_summary import (
    CreateVisitSummaryRequest,
    CreateVisitSummaryResponse,
    PatientDetails,
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
