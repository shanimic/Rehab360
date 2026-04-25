import asyncio
import unittest

from mockito import expect, mock

from app.dal.exercise_repository import ExerciseRepository
from app.models.exercises.exercise import ExerciseData, ExerciseReport, ExerciseReportMetadata, MyPlanResponse
from app.models.patients.patient_exercises import DailyExerciseItem
from app.models.patients.visit_type import VisitType
from app.services.exercise_services import ExerciseServices


def _make_plan_exercise(**overrides) -> DailyExerciseItem:
    defaults = {
        "exercise_id": 1,
        "exercise_name": "Squat",
        "visit_type": VisitType.PHYSIOTHERAPIST,
        "reps": 10,
        "execution_status": False,
        "num_sets": 3,
        "text_instructions": "Keep back straight.",
    }
    defaults.update(overrides)
    return DailyExerciseItem(**defaults)


def _make_metadata(**overrides) -> ExerciseReportMetadata:
    defaults = {
        "exercise_name": "Squat",
        "visit_type": VisitType.PHYSIOTHERAPIST,
        "reps": 10,
        "num_sets": 3,
        "execution_status": True,
        "num_exe_completed": 30,
        "ex_video_url": "https://example.com/squat.mp4",
        "text_instructions": "Keep back straight.",
        "session_id": 1,
        "weekly_plan_id": 2,
        "plan_id": 3,
    }

    defaults.update(overrides)
    return ExerciseReportMetadata(**defaults)


class ExerciseServicesTest(unittest.TestCase):

    # ------------------------------------------------------------------ #
    # get_exercise                                                         #
    # ------------------------------------------------------------------ #

    def test_get_exercise_returns_exercise_data_with_all_fields(self) -> None:
        """
        Given a metadata row exists for the given exercise and patient,
        When get_exercise is called,
        Then an ExerciseData with all mapped fields including num_sets is returned.
        """
        # PREPARE
        repo = mock(ExerciseRepository)
        service = ExerciseServices(repository=repo)
        metadata = _make_metadata()

        # MOCK
        expect(repo, times=1).get_exercise_report_metadata(
            exercise_id="ex-1", patient_id="pat-1"
        ).thenReturn(metadata)

        # ACT
        result = asyncio.run(service.get_exercise(exercise_id="ex-1", patient_id="pat-1"))

        # ASSERT
        assert isinstance(result, ExerciseData)
        assert result.exercise_name == "Squat"
        assert result.visit_type == VisitType.PHYSIOTHERAPIST
        assert result.reps == 10
        assert result.num_sets == 3
        assert result.execution_status is True
        assert result.ex_video_url == "https://example.com/squat.mp4"
        assert result.text_instructions == "Keep back straight."

    # ------------------------------------------------------------------ #
    # post_exercise_report                                                 #
    # ------------------------------------------------------------------ #

    def test_post_exercise_report_delegates_to_repository(self) -> None:
        """
        Given a valid exercise report payload,
        When post_exercise_report is called,
        Then the repository's post_exercise_report is invoked once and None is returned.
        """
        # PREPARE
        repo = mock(ExerciseRepository)
        service = ExerciseServices(repository=repo)
        report = ExerciseReport(
            execution_status=True,
            pain_level=2,
            effort_level=5,
        )

        # MOCK
        expect(repo, times=1).post_exercise_report(
            exercise_id="ex-1", patient_id="pat-1", report=report
        ).thenReturn(None)

        # ACT
        result = asyncio.run(
            service.post_exercise_report(exercise_id="ex-1", patient_id="pat-1", report=report)
        )

        # ASSERT
        assert result is None

    # ------------------------------------------------------------------ #
    # get_patient_plan                                                     #
    # ------------------------------------------------------------------ #

    def test_get_patient_plan_returns_list_from_repository(self) -> None:
        """
        Given the repository returns two exercises for today and none for tomorrow,
        When get_patient_plan is called,
        Then a MyPlanResponse with today_exercises populated is returned.
        """
        # PREPARE
        repo = mock(ExerciseRepository)
        service = ExerciseServices(repository=repo)
        exercises = [
            _make_plan_exercise(exercise_id=1, exercise_name="Squat"),
            _make_plan_exercise(exercise_id=2, exercise_name="Lunge", visit_type=VisitType.FITNESS),
        ]

        # MOCK
        expect(repo, times=1).get_patient_plan(patient_id="pat-1").thenReturn(exercises)
        expect(repo, times=1).get_tommorow_exercises(patient_id="pat-1").thenReturn([])

        # ACT
        result = asyncio.run(service.get_patient_plan(patient_id="pat-1"))

        # ASSERT
        assert isinstance(result, MyPlanResponse)
        assert len(result.today_exercises) == 2
        assert result.today_exercises[0].exercise_name == "Squat"
        assert result.today_exercises[1].visit_type == VisitType.FITNESS
        assert result.tomorrow_exercises == []

    def test_get_patient_plan_empty_returns_empty_list(self) -> None:
        """
        Given the repository returns no rows for the patient today or tomorrow,
        When get_patient_plan is called,
        Then a MyPlanResponse with empty today and tomorrow lists is returned.
        """
        # PREPARE
        repo = mock(ExerciseRepository)
        service = ExerciseServices(repository=repo)

        # MOCK
        expect(repo, times=1).get_patient_plan(patient_id="pat-no-plan").thenReturn([])
        expect(repo, times=1).get_tommorow_exercises(patient_id="pat-no-plan").thenReturn([])

        # ACT
        result = asyncio.run(service.get_patient_plan(patient_id="pat-no-plan"))

        # ASSERT
        assert isinstance(result, MyPlanResponse)
        assert result.today_exercises == []
        assert result.tomorrow_exercises == []
