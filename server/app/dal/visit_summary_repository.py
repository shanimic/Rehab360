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
                    u.user_id          AS patient_id,
                    u.first_name       AS patient_first_name,
                    u.last_name        AS patient_last_name,
                    u.phone,
                    u.birth_date,
                    u.email
                FROM registered_users u
                WHERE u.user_id   = %s
                  AND u.user_role = 'PATIENT'
            """,
            args=(patient_id,),
        )
        row = await self.cursor.fetchone()
        return PatientDetails.model_validate(row) if row else None

    async def create_visit_summary(
        self,
        request: CreateVisitSummaryRequest,
        visit_type: VisitType,
        session_status: str,
    ) -> CreateVisitSummaryResponse:
        """Insert a new visit summary and return its generated session ID.

        Args:
            request: The visit summary data from the caller.
            visit_type: The derived visit type based on the therapist's role.
            session_status: The initial status for the session ('ACTIVE' or 'PENDING_PLAN').

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
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'PATIENT', %s, %s, %s)
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
                session_status,
            ),
        )
        await self.cursor.execute("SELECT LAST_INSERT_ID() AS session_id")
        row = await self.cursor.fetchone()
        return CreateVisitSummaryResponse.model_validate(row)

    async def get_sessions_by_patient(self, patient_id: str) -> list[SessionListItem]:
        """Fetch all committed sessions for a patient, newest first.

        PENDING_PLAN sessions are excluded — they have no saved plan yet and
        must not appear in user-facing session lists.

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
                  AND s.session_status != 'PENDING_PLAN'
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
                INSERT INTO plans (session_id, goal, start_date, end_date, notes)
                VALUES (%s, %s, %s, %s, %s)
            """,
            args=(
                request.session_id,
                request.goal,
                request.start_date,
                request.end_date,
                request.notes,
            ),
        )
        await self.cursor.execute(
            "SELECT LAST_INSERT_ID() AS plan_id, %s AS session_id",
            args=(request.session_id,),
        )
        row = await self.cursor.fetchone()
        return CreatePlanResponse.model_validate(row)

    async def plan_exists_for_session(self, session_id: int) -> bool:
        """Check whether a plan row already exists for the given session.

        Args:
            session_id: The unique identifier of the session.

        Returns:
            True if at least one plan row is linked to this session, False otherwise.
        """
        await self.cursor.execute(
            query="SELECT plan_id FROM plans WHERE session_id = %s LIMIT 1",
            args=(session_id,),
        )
        row = await self.cursor.fetchone()
        return row is not None

    async def get_session_patient_and_type(self, session_id: int) -> dict | None:
        """Return the patient_id and visit_type for a session.

        Args:
            session_id: The unique identifier of the session.

        Returns:
            A dict with ``patient_id`` and ``visit_type``, or None if the session
            does not exist.
        """
        await self.cursor.execute(
            query="SELECT patient_id, visit_type FROM sessions WHERE session_id = %s",
            args=(session_id,),
        )
        return await self.cursor.fetchone()

    async def begin_transaction(self) -> None:
        """Start a database transaction.

        Returns:
            None
        """
        await self.cursor.execute("START TRANSACTION")

    async def commit(self) -> None:
        """Commit the current transaction.

        Returns:
            None
        """
        await self.cursor.execute("COMMIT")

    async def rollback(self) -> None:
        """Roll back the current transaction.

        Returns:
            None
        """
        await self.cursor.execute("ROLLBACK")

    async def get_latest_session_with_plan(
        self, patient_id: str, visit_type: VisitType
    ) -> dict | None:
        """Fetch the most recent committed session that has a linked plan.

        PENDING_PLAN sessions are excluded — they may have no plan yet and
        must not be used as a copy source.

        Args:
            patient_id: The unique identifier of the patient.
            visit_type: The visit type to filter by.

        Returns:
            A dict with session_id and plan_id, or None if no session with a plan exists.
        """
        await self.cursor.execute(
            query="""
                SELECT
                    s.session_id,
                    p.plan_id
                FROM sessions s
                JOIN plans p
                    ON p.session_id = s.session_id
                WHERE s.patient_id     = %s
                  AND s.visit_type     = %s
                  AND s.session_status != 'PENDING_PLAN'
                ORDER BY s.visit_date DESC, s.visit_time DESC
                LIMIT 1
            """,
            args=(patient_id, visit_type.value),
        )
        return await self.cursor.fetchone()

    async def deactivate_sessions_by_patient_and_visit_type(
        self, patient_id: str, visit_type: VisitType
    ) -> None:
        """Set all ACTIVE and PENDING_PLAN sessions for a patient and visit type to 'NOT ACTIVE'.

        Called when a new session is fully committed (copy=true path or plan-save activation)
        to ensure no prior session remains reachable as the current one.

        Args:
            patient_id: The unique identifier of the patient.
            visit_type: The visit type whose sessions should be deactivated.

        Returns:
            None
        """
        await self.cursor.execute(
            query="""
                UPDATE sessions
                SET session_status = 'NOT ACTIVE'
                WHERE patient_id     = %s
                  AND visit_type     = %s
                  AND session_status IN ('ACTIVE', 'PENDING_PLAN')
            """,
            args=(patient_id, visit_type.value),
        )

    async def deactivate_pending_sessions_by_patient_and_visit_type(
        self, patient_id: str, visit_type: VisitType
    ) -> None:
        """Set any PENDING_PLAN sessions for a patient and visit type to 'NOT ACTIVE'.

        Called when a new PENDING_PLAN session is created (copy=false path) to prevent
        orphaned drafts from accumulating. Existing ACTIVE sessions are left untouched.

        Args:
            patient_id: The unique identifier of the patient.
            visit_type: The visit type whose pending sessions should be cleaned up.

        Returns:
            None
        """
        await self.cursor.execute(
            query="""
                UPDATE sessions
                SET session_status = 'NOT ACTIVE'
                WHERE patient_id     = %s
                  AND visit_type     = %s
                  AND session_status = 'PENDING_PLAN'
            """,
            args=(patient_id, visit_type.value),
        )

    async def activate_session(self, session_id: int) -> None:
        """Promote a PENDING_PLAN session to ACTIVE after its plan has been saved.

        Args:
            session_id: The unique identifier of the session to activate.

        Returns:
            None
        """
        await self.cursor.execute(
            query="""
                UPDATE sessions
                SET session_status = 'ACTIVE'
                WHERE session_id = %s
            """,
            args=(session_id,),
        )

    async def copy_plan_to_session(
        self, source_plan_id: int, new_session_id: int
    ) -> int:
        """Copy a plan's data into a new row linked to a different session.

        Args:
            source_plan_id: The plan_id of the plan to copy from.
            new_session_id: The session_id to link the copied plan to.

        Returns:
            The auto-generated plan_id of the newly inserted plan row.
        """
        await self.cursor.execute(
            query="""
                INSERT INTO plans (session_id, goal, start_date, end_date, notes)
                SELECT %s, goal, start_date, end_date, notes
                FROM plans
                WHERE plan_id = %s
            """,
            args=(new_session_id, source_plan_id),
        )
        await self.cursor.execute("SELECT LAST_INSERT_ID() AS plan_id")
        row = await self.cursor.fetchone()
        return int(row["plan_id"])

    async def copy_plan_exercises(
        self,
        source_plan_id: int,
        source_session_id: int,
        new_plan_id: int,
        new_session_id: int,
    ) -> None:
        """Copy all plan_exercises from one plan to another.

        Args:
            source_plan_id: The plan_id of the source plan.
            source_session_id: The session_id of the source plan.
            new_plan_id: The plan_id of the destination plan.
            new_session_id: The session_id of the destination plan.

        Returns:
            None
        """
        await self.cursor.execute(
            query="""
                INSERT INTO plan_exercises (
                    plan_id, session_id, exercise_id,
                    reps, num_sets, weight,
                    time_duration, time_unit, description
                )
                SELECT %s, %s, exercise_id,
                       reps, num_sets, weight,
                       time_duration, time_unit, description
                FROM plan_exercises
                WHERE plan_id    = %s
                  AND session_id = %s
            """,
            args=(new_plan_id, new_session_id, source_plan_id, source_session_id),
        )
