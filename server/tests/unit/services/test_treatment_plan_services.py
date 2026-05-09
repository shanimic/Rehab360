import asyncio
import datetime
import unittest

from fastapi import HTTPException
from mockito import expect, mock

from app.dal.treatment_plan_repository import TreatmentPlanRepository
from app.models.treatment_plan.treatment_plan import (
    CreateTreatmentPlanRequest,
    CreateTreatmentPlanResponse,
    PhysiotherapyExerciseItem,
    PlanExerciseRequest,
    TreatmentPlanContext,
    TreatmentPlanDetailsResponse,
    TreatmentPlanExerciseItem,
)
from app.services.treatment_plan_services import TreatmentPlanServices


def _make_treatment_plan_details(**overrides) -> TreatmentPlanDetailsResponse:
    defaults = {
        "plan_id": 6,
        "session_id": 103,
        "medical_diagnosis": "Shoulder Impingement",
        "visit_type": "PHYSIOTHERAPIST",
        "goal": "Restore full range of motion",
        "start_date": datetime.date(2025, 1, 6),
        "end_date": datetime.date(2025, 3, 1),
        "notes": None,
        "exercises": [],
    }
    defaults.update(overrides)
    return TreatmentPlanDetailsResponse(**defaults)


def _make_plan_exercise_item(**overrides) -> TreatmentPlanExerciseItem:
    defaults = {
        "exercise_id": 1,
        "exercise_name": "Wall Squats",
        "reps": 12,
        "num_sets": 3,
        "weight": None,
        "time_duration": 3,
        "time_unit": "Weekly",
        "description": None,
    }
    defaults.update(overrides)
    return TreatmentPlanExerciseItem(**defaults)


def _make_physio_context(**overrides) -> TreatmentPlanContext:
    defaults = {
        "session_id": 42,
        "medical_diagnosis": "ACL tear",
        "visit_type": "PHYSIOTHERAPIST",
    }
    defaults.update(overrides)
    return TreatmentPlanContext(**defaults)


def _make_exercise_request(**overrides) -> PlanExerciseRequest:
    defaults = {
        "exercise_id": 1,
        "reps": 10,
        "num_sets": 3,
        "weight": 0.0,
        "time_duration": 30,
        "time_unit": "seconds",
        "description": None,
    }
    defaults.update(overrides)
    return PlanExerciseRequest(**defaults)


def _make_create_request(**overrides) -> CreateTreatmentPlanRequest:
    defaults = {
        "goal": "Restore range of motion",
        "start_date": datetime.date(2026, 5, 1),
        "end_date": datetime.date(2026, 7, 1),
        "notes": None,
        "exercises": [_make_exercise_request()],
    }
    defaults.update(overrides)
    return CreateTreatmentPlanRequest(**defaults)


class TreatmentPlanServicesTest(unittest.TestCase):

    # ------------------------------------------------------------------ #
    # get_treatment_plan_context                                           #
    # ------------------------------------------------------------------ #

    def test_get_context_found_returns_context(self) -> None:
        """
        Given the repository returns a PHYSIOTHERAPIST context for the session,
        When get_treatment_plan_context is called,
        Then the TreatmentPlanContext instance is returned.
        """
        # PREPARE
        repo = mock(TreatmentPlanRepository)
        service = TreatmentPlanServices(repository=repo)
        context = _make_physio_context()

        # MOCK
        expect(repo, times=1).get_treatment_plan_context(42).thenReturn(context)

        # ACT
        result = asyncio.run(service.get_treatment_plan_context(42))

        # ASSERT
        self.assertEqual(result.session_id, 42)
        self.assertEqual(result.visit_type, "PHYSIOTHERAPIST")
        self.assertEqual(result.medical_diagnosis, "ACL tear")

    def test_get_context_not_found_raises_404(self) -> None:
        """
        Given the repository returns None for the session_id,
        When get_treatment_plan_context is called,
        Then an HTTP 404 Not Found exception is raised.
        """
        # PREPARE
        repo = mock(TreatmentPlanRepository)
        service = TreatmentPlanServices(repository=repo)

        # MOCK
        expect(repo, times=1).get_treatment_plan_context(999).thenReturn(None)

        # ACT / ASSERT
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(service.get_treatment_plan_context(999))
        self.assertEqual(ctx.exception.status_code, 404)

    def test_get_context_fitness_session_returns_context(self) -> None:
        """
        Given the repository returns a FITNESS context for the session,
        When get_treatment_plan_context is called,
        Then the TreatmentPlanContext with visit_type FITNESS is returned (no 400 error).
        """
        # PREPARE
        repo = mock(TreatmentPlanRepository)
        service = TreatmentPlanServices(repository=repo)
        context = _make_physio_context(visit_type="FITNESS")

        # MOCK
        expect(repo, times=1).get_treatment_plan_context(42).thenReturn(context)

        # ACT
        result = asyncio.run(service.get_treatment_plan_context(42))

        # ASSERT
        self.assertEqual(result.visit_type, "FITNESS")
        self.assertEqual(result.session_id, 42)

    # ------------------------------------------------------------------ #
    # get_exercises                                                        #
    # ------------------------------------------------------------------ #

    def test_get_exercises_returns_physiotherapist_list(self) -> None:
        """
        Given the repository returns two exercise items for PHYSIOTHERAPIST,
        When get_exercises is called with visit_type PHYSIOTHERAPIST,
        Then a list of two PhysiotherapyExerciseItem instances is returned.
        """
        # PREPARE
        repo = mock(TreatmentPlanRepository)
        service = TreatmentPlanServices(repository=repo)
        exercises = [
            PhysiotherapyExerciseItem(exercise_id=1, exercise_name="Curl"),
            PhysiotherapyExerciseItem(exercise_id=2, exercise_name="Press"),
        ]

        # MOCK
        expect(repo, times=1).get_exercises_by_visit_type(
            "PHYSIOTHERAPIST"
        ).thenReturn(exercises)

        # ACT
        result = asyncio.run(service.get_exercises("PHYSIOTHERAPIST"))

        # ASSERT
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0].exercise_name, "Curl")
        self.assertEqual(result[1].exercise_id, 2)

    def test_get_fitness_exercises_returns_list(self) -> None:
        """
        Given the repository returns two exercise items for FITNESS,
        When get_exercises is called with visit_type FITNESS,
        Then a list of two PhysiotherapyExerciseItem instances is returned.
        """
        # PREPARE
        repo = mock(TreatmentPlanRepository)
        service = TreatmentPlanServices(repository=repo)
        exercises = [
            PhysiotherapyExerciseItem(exercise_id=5, exercise_name="Wall Squats"),
            PhysiotherapyExerciseItem(exercise_id=6, exercise_name="Plank"),
        ]

        # MOCK
        expect(repo, times=1).get_exercises_by_visit_type("FITNESS").thenReturn(
            exercises
        )

        # ACT
        result = asyncio.run(service.get_exercises("FITNESS"))

        # ASSERT
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0].exercise_name, "Wall Squats")
        self.assertEqual(result[1].exercise_id, 6)

    # ------------------------------------------------------------------ #
    # create_treatment_plan                                                #
    # ------------------------------------------------------------------ #

    def test_create_plan_success(self) -> None:
        """
        Given a valid PHYSIOTHERAPIST session, no existing plan, and valid exercises,
        When create_treatment_plan is called,
        Then the repository creates the plan and returns CreateTreatmentPlanResponse.
        """
        # PREPARE
        repo = mock(TreatmentPlanRepository)
        service = TreatmentPlanServices(repository=repo)
        context = _make_physio_context()
        request = _make_create_request()
        response = CreateTreatmentPlanResponse(plan_id=10, session_id=42)

        # MOCK
        expect(repo, times=1).get_treatment_plan_context(42).thenReturn(context)
        expect(repo, times=1).plan_exists(42).thenReturn(False)
        expect(repo, times=1).get_valid_exercise_ids([1], "PHYSIOTHERAPIST").thenReturn(
            [1]
        )
        expect(repo, times=1).create_treatment_plan(42, request).thenReturn(response)

        # ACT
        result = asyncio.run(service.create_treatment_plan(42, request))

        # ASSERT
        self.assertEqual(result.plan_id, 10)
        self.assertEqual(result.session_id, 42)

    def test_create_fitness_plan_success(self) -> None:
        """
        Given a valid FITNESS session, no existing plan, and valid FITNESS exercises,
        When create_treatment_plan is called,
        Then the repository creates the plan and returns CreateTreatmentPlanResponse.
        """
        # PREPARE
        repo = mock(TreatmentPlanRepository)
        service = TreatmentPlanServices(repository=repo)
        context = _make_physio_context(visit_type="FITNESS", medical_diagnosis="Knee strengthening")
        request = _make_create_request(
            goal="Build lower body strength",
            exercises=[_make_exercise_request(exercise_id=5)],
        )
        response = CreateTreatmentPlanResponse(plan_id=20, session_id=42)

        # MOCK
        expect(repo, times=1).get_treatment_plan_context(42).thenReturn(context)
        expect(repo, times=1).plan_exists(42).thenReturn(False)
        expect(repo, times=1).get_valid_exercise_ids([5], "FITNESS").thenReturn([5])
        expect(repo, times=1).create_treatment_plan(42, request).thenReturn(response)

        # ACT
        result = asyncio.run(service.create_treatment_plan(42, request))

        # ASSERT
        self.assertEqual(result.plan_id, 20)
        self.assertEqual(result.session_id, 42)

    def test_create_plan_session_not_found_raises_404(self) -> None:
        """
        Given the repository returns None for the session,
        When create_treatment_plan is called,
        Then an HTTP 404 Not Found exception is raised.
        """
        # PREPARE
        repo = mock(TreatmentPlanRepository)
        service = TreatmentPlanServices(repository=repo)
        request = _make_create_request()

        # MOCK
        expect(repo, times=1).get_treatment_plan_context(42).thenReturn(None)

        # ACT / ASSERT
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(service.create_treatment_plan(42, request))
        self.assertEqual(ctx.exception.status_code, 404)

    def test_create_plan_already_exists_raises_409(self) -> None:
        """
        Given a treatment plan already exists for the session,
        When create_treatment_plan is called,
        Then an HTTP 409 Conflict exception is raised.
        """
        # PREPARE
        repo = mock(TreatmentPlanRepository)
        service = TreatmentPlanServices(repository=repo)
        context = _make_physio_context()
        request = _make_create_request()

        # MOCK
        expect(repo, times=1).get_treatment_plan_context(42).thenReturn(context)
        expect(repo, times=1).plan_exists(42).thenReturn(True)

        # ACT / ASSERT
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(service.create_treatment_plan(42, request))
        self.assertEqual(ctx.exception.status_code, 409)

    def test_create_plan_mismatched_exercise_type_raises_400(self) -> None:
        """
        Given a PHYSIOTHERAPIST session and one exercise whose visit_type
        does not match (i.e. it is not in the valid PHYSIOTHERAPIST set),
        When create_treatment_plan is called,
        Then an HTTP 400 Bad Request exception is raised.
        """
        # PREPARE
        repo = mock(TreatmentPlanRepository)
        service = TreatmentPlanServices(repository=repo)
        context = _make_physio_context()
        request = _make_create_request(
            exercises=[
                _make_exercise_request(exercise_id=1),
                _make_exercise_request(exercise_id=99),
            ]
        )

        # MOCK
        expect(repo, times=1).get_treatment_plan_context(42).thenReturn(context)
        expect(repo, times=1).plan_exists(42).thenReturn(False)
        expect(repo, times=1).get_valid_exercise_ids(
            [1, 99], "PHYSIOTHERAPIST"
        ).thenReturn([1])

        # ACT / ASSERT
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(service.create_treatment_plan(42, request))
        self.assertEqual(ctx.exception.status_code, 400)

    # ------------------------------------------------------------------ #
    # get_treatment_plan_by_plan_id                                        #
    # ------------------------------------------------------------------ #

    def test_get_treatment_plan_by_plan_id_returns_details(self) -> None:
        """
        Given the repository returns a plan header and a list of exercises,
        When get_treatment_plan_by_plan_id is called,
        Then the combined TreatmentPlanDetailsResponse is returned.
        """
        # PREPARE
        repo = mock(TreatmentPlanRepository)
        service = TreatmentPlanServices(repository=repo)
        plan = _make_treatment_plan_details()
        exercises = [_make_plan_exercise_item()]

        # MOCK
        expect(repo, times=1).get_treatment_plan_by_plan_id(6).thenReturn(plan)
        expect(repo, times=1).get_exercises_by_plan(6, 103).thenReturn(exercises)

        # ACT
        result = asyncio.run(service.get_treatment_plan_by_plan_id(6))

        # ASSERT
        self.assertEqual(result.plan_id, 6)
        self.assertEqual(result.medical_diagnosis, "Shoulder Impingement")
        self.assertEqual(result.visit_type, "PHYSIOTHERAPIST")
        self.assertEqual(len(result.exercises), 1)
        self.assertEqual(result.exercises[0].exercise_name, "Wall Squats")

    def test_get_treatment_plan_by_plan_id_not_found_raises_404(self) -> None:
        """
        Given the repository returns None for the plan_id,
        When get_treatment_plan_by_plan_id is called,
        Then an HTTP 404 Not Found exception is raised.
        """
        # PREPARE
        repo = mock(TreatmentPlanRepository)
        service = TreatmentPlanServices(repository=repo)

        # MOCK
        expect(repo, times=1).get_treatment_plan_by_plan_id(9999).thenReturn(None)

        # ACT / ASSERT
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(service.get_treatment_plan_by_plan_id(9999))
        self.assertEqual(ctx.exception.status_code, 404)

    def test_get_treatment_plan_by_plan_id_returns_fitness_plan_with_correct_visit_type(
        self,
    ) -> None:
        """
        Given the repository returns a FITNESS plan with one exercise,
        When get_treatment_plan_by_plan_id is called,
        Then the returned response has visit_type FITNESS and exercises attached.
        """
        # PREPARE
        repo = mock(TreatmentPlanRepository)
        service = TreatmentPlanServices(repository=repo)
        fitness_plan = _make_treatment_plan_details(
            plan_id=20,
            session_id=77,
            visit_type="FITNESS",
            medical_diagnosis="Knee strengthening",
        )
        exercises = [_make_plan_exercise_item(exercise_id=5, exercise_name="Wall Squats")]

        # MOCK
        expect(repo, times=1).get_treatment_plan_by_plan_id(20).thenReturn(fitness_plan)
        expect(repo, times=1).get_exercises_by_plan(20, 77).thenReturn(exercises)

        # ACT
        result = asyncio.run(service.get_treatment_plan_by_plan_id(20))

        # ASSERT
        self.assertEqual(result.visit_type, "FITNESS")
        self.assertEqual(result.plan_id, 20)
        self.assertEqual(len(result.exercises), 1)
        self.assertEqual(result.exercises[0].exercise_name, "Wall Squats")

    # ------------------------------------------------------------------ #
    # create_treatment_plan — additional cross-type and mismatch cases    #
    # ------------------------------------------------------------------ #

    def test_create_plan_fitness_session_with_pt_exercise_raises_400(self) -> None:
        """
        Given a FITNESS session and an exercise that belongs to PHYSIOTHERAPIST,
        When create_treatment_plan is called,
        Then an HTTP 400 Bad Request exception is raised.
        """
        # PREPARE
        repo = mock(TreatmentPlanRepository)
        service = TreatmentPlanServices(repository=repo)
        context = _make_physio_context(visit_type="FITNESS", medical_diagnosis="Knee strengthening")
        request = _make_create_request(exercises=[_make_exercise_request(exercise_id=1)])

        # MOCK — exercise ID 1 is a PT exercise; not valid for FITNESS
        expect(repo, times=1).get_treatment_plan_context(42).thenReturn(context)
        expect(repo, times=1).plan_exists(42).thenReturn(False)
        expect(repo, times=1).get_valid_exercise_ids([1], "FITNESS").thenReturn([])

        # ACT / ASSERT
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(service.create_treatment_plan(42, request))
        self.assertEqual(ctx.exception.status_code, 400)

    def test_create_plan_with_partial_exercise_mismatch_raises_400(self) -> None:
        """
        Given a PHYSIOTHERAPIST session and three exercises where one is invalid,
        When create_treatment_plan is called,
        Then an HTTP 400 Bad Request exception is raised.
        """
        # PREPARE
        repo = mock(TreatmentPlanRepository)
        service = TreatmentPlanServices(repository=repo)
        context = _make_physio_context()
        request = _make_create_request(
            exercises=[
                _make_exercise_request(exercise_id=1),
                _make_exercise_request(exercise_id=2),
                _make_exercise_request(exercise_id=99),
            ]
        )

        # MOCK — IDs 1 and 2 are valid; 99 is not in the PHYSIOTHERAPIST set
        expect(repo, times=1).get_treatment_plan_context(42).thenReturn(context)
        expect(repo, times=1).plan_exists(42).thenReturn(False)
        expect(repo, times=1).get_valid_exercise_ids(
            [1, 2, 99], "PHYSIOTHERAPIST"
        ).thenReturn([1, 2])

        # ACT / ASSERT
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(service.create_treatment_plan(42, request))
        self.assertEqual(ctx.exception.status_code, 400)
