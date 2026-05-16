import datetime

from pydantic import BaseModel


class HomePatientCard(BaseModel):
    """One patient card shown on the therapist homepage."""

    patient_id: str
    first_name: str
    last_name: str
    medical_diagnosis: str
    progress_percentage: float
    last_progress_update: datetime.date | None = None


class AllPatientItem(BaseModel):
    """A patient entry returned for the all-patients modal."""

    patient_id: str
    first_name: str
    last_name: str
