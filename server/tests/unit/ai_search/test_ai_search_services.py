import asyncio
import datetime
import json
import unittest

from fastapi import HTTPException
from google import genai as genai_module
from mockito import expect, mock

from app.dal.ai_search_repository import AiSearchRepository, ContentData
from app.models.ai_search.ai_search import (
    AiSearchRequest,
    SaveContentRequest,
    VerifyContentRequest,
)
from app.services.ai_search_services import AiSearchServices


def _make_search_request(**overrides) -> AiSearchRequest:
    defaults = {
        "query_text": "How to recover from ACL surgery?",
        "user_id": "P100",
        "user_role": "PATIENT",
    }
    defaults.update(overrides)
    return AiSearchRequest(**defaults)


def _make_save_request(**overrides) -> SaveContentRequest:
    defaults = {
        "title": "ACL Recovery Guide",
        "url": "https://example.com/acl-guide",
        "content_text": None,
        "content_type": "Article",
        "query_id": 1,
        "user_id": "P100",
        "user_role": "PATIENT",
    }
    defaults.update(overrides)
    return SaveContentRequest(**defaults)


def _make_verify_request(**overrides) -> VerifyContentRequest:
    defaults = {
        "url": "https://example.com/acl-guide",
        "query_id": 1,
        "user_id": "T200",
        "user_role": "PHYSIOTHERAPIST",
        "verified": True,
    }
    defaults.update(overrides)
    return VerifyContentRequest(**defaults)


def _mock_gemini_response(summary: str = "Test summary", sources: list | None = None):
    """Return a mock Gemini response object with a pre-set text attribute."""
    if sources is None:
        sources = [
            {
                "title": "ACL Guide",
                "url": "https://example.com/acl-guide",
                "description": "A guide to ACL recovery.",
                "content_type": "Article",
            }
        ]
    gemini_response = mock()
    gemini_response.text = json.dumps({"summary": summary, "sources": sources})
    return gemini_response


class AiSearchServicesTest(unittest.TestCase):

    # ------------------------------------------------------------------ #
    # search                                                               #
    # ------------------------------------------------------------------ #

    def test_search_returns_response(self) -> None:
        """
        Given Gemini returns valid JSON and the repo returns query_id=1 with no verified URLs,
        When search is called,
        Then an AiSearchResponse with the correct query_id, summary, and sources is returned.
        """
        # PREPARE
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)
        request = _make_search_request()
        mock_client = mock()
        mock_models = mock()
        mock_client.models = mock_models
        gemini_response = _mock_gemini_response()

        # MOCK
        expect(repo, times=1).insert_query(
            request.query_text, request.user_id, request.user_role
        ).thenReturn(1)
        expect(genai_module, times=1).Client(...).thenReturn(mock_client)
        expect(mock_models, times=1).generate_content(...).thenReturn(gemini_response)
        expect(repo, times=1).get_verified_content_url_flags().thenReturn({})

        # ACT
        result = asyncio.run(service.search(request))

        # ASSERT
        self.assertEqual(result.query_id, 1)
        self.assertEqual(result.summary, "Test summary")
        self.assertEqual(len(result.sources), 1)
        self.assertEqual(result.sources[0].physio_verification_count, 0)
        self.assertEqual(result.sources[0].trainer_verification_count, 0)

    def test_search_source_with_multiple_verifications(self) -> None:
        """
        Given get_verified_content_url_flags returns physio=3, trainer=2 for a source URL,
        When search is called,
        Then the matching source card has physio_verification_count=3 and trainer_verification_count=2.
        """
        # PREPARE
        verified_url = "https://example.com/acl-guide"
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)
        request = _make_search_request()
        mock_client = mock()
        mock_models = mock()
        mock_client.models = mock_models
        gemini_response = _mock_gemini_response()
        flags = {verified_url: {"physio": 3, "trainer": 2}}

        # MOCK
        expect(repo, times=1).insert_query(
            request.query_text, request.user_id, request.user_role
        ).thenReturn(1)
        expect(genai_module, times=1).Client(...).thenReturn(mock_client)
        expect(mock_models, times=1).generate_content(...).thenReturn(gemini_response)
        expect(repo, times=1).get_verified_content_url_flags().thenReturn(flags)

        # ACT
        result = asyncio.run(service.search(request))

        # ASSERT
        self.assertEqual(result.sources[0].physio_verification_count, 3)
        self.assertEqual(result.sources[0].trainer_verification_count, 2)

    def test_search_unverified_source_gets_zero_counts(self) -> None:
        """
        Given get_verified_content_url_flags returns flags for a different URL,
        When search is called,
        Then the returned source card has both counts equal to 0.
        """
        # PREPARE
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)
        request = _make_search_request()
        mock_client = mock()
        mock_models = mock()
        mock_client.models = mock_models
        gemini_response = _mock_gemini_response()
        flags = {"https://other.example.com/guide": {"physio": 1, "trainer": 0}}

        # MOCK
        expect(repo, times=1).insert_query(
            request.query_text, request.user_id, request.user_role
        ).thenReturn(1)
        expect(genai_module, times=1).Client(...).thenReturn(mock_client)
        expect(mock_models, times=1).generate_content(...).thenReturn(gemini_response)
        expect(repo, times=1).get_verified_content_url_flags().thenReturn(flags)

        # ACT
        result = asyncio.run(service.search(request))

        # ASSERT
        self.assertEqual(result.sources[0].physio_verification_count, 0)
        self.assertEqual(result.sources[0].trainer_verification_count, 0)

    def test_search_raises_502_on_gemini_api_exception(self) -> None:
        """
        Given generate_content raises a generic RuntimeError,
        When search is called,
        Then an HTTPException with status 502 Bad Gateway is raised.
        """
        # PREPARE
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)
        request = _make_search_request()
        mock_client = mock()
        mock_models = mock()
        mock_client.models = mock_models

        # MOCK
        expect(repo, times=1).insert_query(
            request.query_text, request.user_id, request.user_role
        ).thenReturn(1)
        expect(genai_module, times=1).Client(...).thenReturn(mock_client)
        expect(mock_models, times=1).generate_content(...).thenRaise(
            RuntimeError("network error")
        )

        # ACT / ASSERT
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(service.search(request))
        self.assertEqual(ctx.exception.status_code, 502)

    def test_search_raises_503_on_gemini_unavailable(self) -> None:
        """
        Given generate_content raises an exception containing 'UNAVAILABLE',
        When search is called,
        Then an HTTPException with status 503 Service Unavailable is raised.
        """
        # PREPARE
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)
        request = _make_search_request()
        mock_client = mock()
        mock_models = mock()
        mock_client.models = mock_models

        # MOCK
        expect(repo, times=1).insert_query(
            request.query_text, request.user_id, request.user_role
        ).thenReturn(1)
        expect(genai_module, times=1).Client(...).thenReturn(mock_client)
        expect(mock_models, times=1).generate_content(...).thenRaise(
            RuntimeError("503 UNAVAILABLE. This model is currently experiencing high demand.")
        )

        # ACT / ASSERT
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(service.search(request))
        self.assertEqual(ctx.exception.status_code, 503)

    def test_search_raises_502_on_bad_json(self) -> None:
        """
        Given Gemini returns malformed text that cannot be parsed as valid JSON,
        When search is called,
        Then an HTTPException with status 502 Bad Gateway is raised.
        """
        # PREPARE
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)
        request = _make_search_request()
        mock_client = mock()
        mock_models = mock()
        mock_client.models = mock_models
        bad_response = mock()
        bad_response.text = "this is not valid json {{{"

        # MOCK
        expect(repo, times=1).insert_query(
            request.query_text, request.user_id, request.user_role
        ).thenReturn(1)
        expect(genai_module, times=1).Client(...).thenReturn(mock_client)
        expect(mock_models, times=1).generate_content(...).thenReturn(bad_response)

        # ACT / ASSERT
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(service.search(request))
        self.assertEqual(ctx.exception.status_code, 502)

    def test_search_marks_physio_verified_source(self) -> None:
        """
        Given Gemini returns a source whose URL is physio-verified in the flags dict,
        When search is called,
        Then the matching source card has physio_verification_count=1 and trainer_verification_count=0.
        """
        # PREPARE
        verified_url = "https://example.com/verified-guide"
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)
        request = _make_search_request()
        mock_client = mock()
        mock_models = mock()
        mock_client.models = mock_models
        gemini_response = _mock_gemini_response(
            sources=[
                {
                    "title": "Verified Guide",
                    "url": verified_url,
                    "description": "A verified resource.",
                    "content_type": "Clinical Guideline",
                }
            ]
        )
        flags = {verified_url: {"physio": 1, "trainer": 0}}

        # MOCK
        expect(repo, times=1).insert_query(
            request.query_text, request.user_id, request.user_role
        ).thenReturn(1)
        expect(genai_module, times=1).Client(...).thenReturn(mock_client)
        expect(mock_models, times=1).generate_content(...).thenReturn(gemini_response)
        expect(repo, times=1).get_verified_content_url_flags().thenReturn(flags)

        # ACT
        result = asyncio.run(service.search(request))

        # ASSERT
        self.assertEqual(len(result.sources), 1)
        self.assertEqual(result.sources[0].physio_verification_count, 1)
        self.assertEqual(result.sources[0].trainer_verification_count, 0)

    # ------------------------------------------------------------------ #
    # get_query_history                                                    #
    # ------------------------------------------------------------------ #

    def test_get_query_history_returns_items(self) -> None:
        """
        Given the repository returns two query dict rows for the user,
        When get_query_history is called,
        Then a list of two QueryHistoryItem instances is returned with correct values.
        """
        # PREPARE
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)
        rows = [
            {
                "query_id": 2,
                "query_text": "Second query",
                "query_date": datetime.date(2026, 5, 2),
            },
            {
                "query_id": 1,
                "query_text": "First query",
                "query_date": datetime.date(2026, 5, 1),
            },
        ]

        # MOCK
        expect(repo, times=1).get_queries_by_user("P100").thenReturn(rows)

        # ACT
        result = asyncio.run(service.get_query_history("P100"))

        # ASSERT
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0].query_id, 2)
        self.assertEqual(result[1].query_text, "First query")

    # ------------------------------------------------------------------ #
    # delete_query                                                         #
    # ------------------------------------------------------------------ #

    def test_delete_query_calls_cascade(self) -> None:
        """
        Given a query_id of 1,
        When delete_query is called,
        Then repository.delete_query_cascade is called exactly once with that query_id.
        """
        # PREPARE
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)

        # MOCK
        expect(repo, times=1).delete_query_cascade(1).thenReturn(None)

        # ACT
        asyncio.run(service.delete_query(1))

        # ASSERT — verified by expect(times=1)

    # ------------------------------------------------------------------ #
    # save_content                                                         #
    # ------------------------------------------------------------------ #

    def test_save_content_no_existing_content_inserts_both(self) -> None:
        """
        Given no content row exists for this URL and query,
        When save_content is called,
        Then insert_content and insert_saved_content are each called exactly once.
        """
        # PREPARE
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)
        request = _make_save_request()
        expected_data = ContentData(
            title=request.title,
            url=request.url,
            content_text=request.content_text,
            content_type=request.content_type,
            query_id=request.query_id,
        )

        # MOCK
        expect(repo, times=1).get_content_by_url_and_query(
            request.url, request.query_id
        ).thenReturn(None)
        expect(repo, times=1).insert_content(expected_data).thenReturn(5)
        expect(repo, times=1).get_verification_flags_by_url(
            request.url
        ).thenReturn({"physio": 0, "trainer": 0})
        expect(repo, times=1).get_recommendation_by_content_and_user(
            5, request.user_id
        ).thenReturn(None)
        expect(repo, times=1).insert_saved_content(
            5, request.user_id, request.user_role
        ).thenReturn(1)

        # ACT
        asyncio.run(service.save_content(request))

        # ASSERT — verified by expect(times=1)

    def test_save_content_new_content_inherits_verification_flags(self) -> None:
        """
        Given no content row exists for this URL and query,
        but the URL was already verified by a physio in a different query,
        When save_content is called,
        Then the new content row inherits the verified flag via update_verified_flag.
        """
        # PREPARE
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)
        request = _make_save_request()
        expected_data = ContentData(
            title=request.title,
            url=request.url,
            content_text=request.content_text,
            content_type=request.content_type,
            query_id=request.query_id,
        )

        # MOCK
        expect(repo, times=1).get_content_by_url_and_query(
            request.url, request.query_id
        ).thenReturn(None)
        expect(repo, times=1).insert_content(expected_data).thenReturn(5)
        expect(repo, times=1).get_verification_flags_by_url(
            request.url
        ).thenReturn({"physio": 1, "trainer": 0})
        expect(repo, times=1).set_content_verification_counts(5, 1, 0).thenReturn(None)
        expect(repo, times=1).get_recommendation_by_content_and_user(
            5, request.user_id
        ).thenReturn(None)
        expect(repo, times=1).insert_saved_content(
            5, request.user_id, request.user_role
        ).thenReturn(1)

        # ACT
        asyncio.run(service.save_content(request))

        # ASSERT — verified by expect(times=1)

    def test_save_content_existing_content_inserts_recommendation(self) -> None:
        """
        Given a content row already exists but no recommendation for this user,
        When save_content is called,
        Then insert_content is NOT called, update_content_metadata and
        insert_saved_content are each called once.
        """
        # PREPARE
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)
        request = _make_save_request()

        # MOCK
        expect(repo, times=1).get_content_by_url_and_query(
            request.url, request.query_id
        ).thenReturn({"content_id": 5})
        expect(repo, times=1).update_content_metadata(
            5, request.title, request.content_text, request.content_type
        ).thenReturn(None)
        expect(repo, times=1).get_recommendation_by_content_and_user(
            5, request.user_id
        ).thenReturn(None)
        expect(repo, times=1).insert_saved_content(
            5, request.user_id, request.user_role
        ).thenReturn(1)

        # ACT
        asyncio.run(service.save_content(request))

        # ASSERT — verified by expect(times=1); insert_content was not set up so not called

    def test_save_content_already_saved_skips_recommendation_insert(self) -> None:
        """
        Given both a content row and a recommendation row already exist for this user,
        When save_content is called,
        Then insert_content and insert_saved_content are NOT called.
        """
        # PREPARE
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)
        request = _make_save_request()

        # MOCK
        expect(repo, times=1).get_content_by_url_and_query(
            request.url, request.query_id
        ).thenReturn({"content_id": 5})
        expect(repo, times=1).update_content_metadata(
            5, request.title, request.content_text, request.content_type
        ).thenReturn(None)
        expect(repo, times=1).get_recommendation_by_content_and_user(
            5, request.user_id
        ).thenReturn({"saving_id": 3})

        # ACT
        asyncio.run(service.save_content(request))

        # ASSERT — verified by expect(times=1); insert_saved_content not set up so not called

    # ------------------------------------------------------------------ #
    # unsave_content                                                       #
    # ------------------------------------------------------------------ #

    def test_unsave_content_delegates(self) -> None:
        """
        Given a saving_id of 7,
        When unsave_content is called,
        Then repository.delete_saved_content is called exactly once with 7.
        """
        # PREPARE
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)

        # MOCK
        expect(repo, times=1).delete_saved_content(7).thenReturn(None)

        # ACT
        asyncio.run(service.unsave_content(7))

        # ASSERT — verified by expect(times=1)

    # ------------------------------------------------------------------ #
    # verify_content                                                       #
    # ------------------------------------------------------------------ #

    def test_verify_content_content_exists(self) -> None:
        """
        Given a content row already exists for the URL and query,
        When verify_content is called by a PHYSIOTHERAPIST with verified=True,
        Then only update_verified_flag is called with the URL — no recommendation inserts.
        """
        # PREPARE
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)
        request = _make_verify_request()

        # MOCK
        expect(repo, times=1).get_content_by_url_and_query(
            request.url, request.query_id
        ).thenReturn({"content_id": 2})
        expect(repo, times=1).update_verified_flag(request.url, request.user_role, True).thenReturn(None)

        # ACT
        asyncio.run(service.verify_content(request))

        # ASSERT — verified by expect(times=1)

    def test_verify_content_nothing_exists(self) -> None:
        """
        Given no content row exists for the URL and query,
        When verify_content is called by a PHYSIOTHERAPIST with verified=True,
        Then a skeleton content row is inserted and update_verified_flag is called.
        """
        # PREPARE
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)
        request = _make_verify_request()
        expected_data = ContentData(
            title="",
            url=request.url,
            content_text=None,
            content_type="",
            query_id=request.query_id,
        )

        # MOCK
        expect(repo, times=1).get_content_by_url_and_query(
            request.url, request.query_id
        ).thenReturn(None)
        expect(repo, times=1).insert_content(expected_data).thenReturn(10)
        expect(repo, times=1).update_verified_flag(request.url, request.user_role, True).thenReturn(None)

        # ACT
        asyncio.run(service.verify_content(request))

        # ASSERT — verified by expect(times=1)

    def test_verify_content_unverify(self) -> None:
        """
        Given a content row exists and verified=False in the request,
        When verify_content is called by a PHYSIOTHERAPIST,
        Then update_verified_flag is called with value=False to clear the flag.
        """
        # PREPARE
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)
        request = _make_verify_request(verified=False)

        # MOCK
        expect(repo, times=1).get_content_by_url_and_query(
            request.url, request.query_id
        ).thenReturn({"content_id": 2})
        expect(repo, times=1).update_verified_flag(request.url, request.user_role, False).thenReturn(None)

        # ACT
        asyncio.run(service.verify_content(request))

        # ASSERT — verified by expect(times=1)

    def test_get_saved_content_returns_items(self) -> None:
        """
        Given the repository returns two saved content rows with integer verification counts,
        When get_saved_content is called,
        Then a list of two SavedContentItem instances is returned with correct count values.
        """
        # PREPARE
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)
        rows = [
            {
                "saving_id": 2,
                "content_id": 10,
                "query_id": 1,
                "content_title": "ACL Guide",
                "source_url": "https://example.com/acl-guide",
                "content_text": "A guide to ACL recovery.",
                "content_type": "Article",
                "physio_verification_count": 2,
                "trainer_verification_count": 1,
                "created_at": datetime.date(2026, 5, 1),
            },
            {
                "saving_id": 1,
                "content_id": 9,
                "query_id": 1,
                "content_title": "RICE Method",
                "source_url": "https://webmd.com/rice",
                "content_text": None,
                "content_type": "Article",
                "physio_verification_count": 0,
                "trainer_verification_count": 0,
                "created_at": datetime.date(2026, 4, 30),
            },
        ]

        # MOCK
        expect(repo, times=1).get_saved_content_by_user("P100").thenReturn(rows)

        # ACT
        result = asyncio.run(service.get_saved_content("P100"))

        # ASSERT
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0].physio_verification_count, 2)
        self.assertEqual(result[0].trainer_verification_count, 1)
        self.assertEqual(result[1].physio_verification_count, 0)

    def test_verify_content_fitness_trainer_role(self) -> None:
        """
        Given a content row exists and user_role is FITNESS_TRAINER with verified=True,
        When verify_content is called,
        Then update_verified_flag is called with 'FITNESS_TRAINER' and True.
        """
        # PREPARE
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)
        request = _make_verify_request(user_role="FITNESS_TRAINER", user_id="F300")

        # MOCK
        expect(repo, times=1).get_content_by_url_and_query(
            request.url, request.query_id
        ).thenReturn({"content_id": 2})
        expect(repo, times=1).update_verified_flag(
            request.url, "FITNESS_TRAINER", True
        ).thenReturn(None)

        # ACT
        asyncio.run(service.verify_content(request))

        # ASSERT — verified by expect(times=1)

    def test_verify_content_unverify_fitness_trainer(self) -> None:
        """
        Given a content row exists and user_role is FITNESS_TRAINER with verified=False,
        When verify_content is called,
        Then update_verified_flag is called with 'FITNESS_TRAINER' and False.
        """
        # PREPARE
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)
        request = _make_verify_request(user_role="FITNESS_TRAINER", user_id="F300", verified=False)

        # MOCK
        expect(repo, times=1).get_content_by_url_and_query(
            request.url, request.query_id
        ).thenReturn({"content_id": 2})
        expect(repo, times=1).update_verified_flag(
            request.url, "FITNESS_TRAINER", False
        ).thenReturn(None)

        # ACT
        asyncio.run(service.verify_content(request))

        # ASSERT — verified by expect(times=1)

    def test_verify_content_patient_raises_403(self) -> None:
        """
        Given a VerifyContentRequest with user_role PATIENT (not a professional),
        When verify_content is called,
        Then an HTTPException with status 403 Forbidden is raised before any repository call.
        """
        # PREPARE
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)
        request = _make_verify_request(user_role="PATIENT")

        # ACT / ASSERT
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(service.verify_content(request))
        self.assertEqual(ctx.exception.status_code, 403)
