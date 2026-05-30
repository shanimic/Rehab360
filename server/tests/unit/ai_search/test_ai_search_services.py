import asyncio
import datetime
import json
import unittest

import httpx
from fastapi import HTTPException
from google import genai as genai_module
from mockito import expect, mock

import app.services.ai_search_services as ai_search_module
from app.dal.ai_search_repository import AiSearchRepository, ContentData
from app.models.ai_search.ai_search import (
    AiSearchRequest,
    SaveContentRequest,
    VerifyContentRequest,
)
from app.services.ai_search_services import (
    AiSearchServices,
    _VERTEX_REDIRECT_PREFIX,
    _resolve_url,
)


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
    """Return a mock Gemini response with text including URLs in the JSON payload."""
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
        expect(ai_search_module, times=1)._resolve_grounding_urls(...).thenReturn(
            ["https://example.com/acl-guide"]
        )
        expect(repo, times=1).get_all_url_verifications().thenReturn({})

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
        Given get_all_url_verifications returns physio=3, trainer=2 for a source URL,
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
        expect(ai_search_module, times=1)._resolve_grounding_urls(...).thenReturn(
            ["https://example.com/acl-guide"]
        )
        expect(repo, times=1).get_all_url_verifications().thenReturn(flags)

        # ACT
        result = asyncio.run(service.search(request))

        # ASSERT
        self.assertEqual(result.sources[0].physio_verification_count, 3)
        self.assertEqual(result.sources[0].trainer_verification_count, 2)

    def test_search_unverified_source_gets_zero_counts(self) -> None:
        """
        Given get_all_url_verifications returns flags for a different URL,
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
        expect(ai_search_module, times=1)._resolve_grounding_urls(...).thenReturn(
            ["https://example.com/acl-guide"]
        )
        expect(repo, times=1).get_all_url_verifications().thenReturn(flags)

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
        # _resolve_grounding_urls is not reached when generate_content raises

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
        # _resolve_grounding_urls is not reached when generate_content raises

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
        # _resolve_grounding_urls is not reached when JSON parsing fails

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
        expect(ai_search_module, times=1)._resolve_grounding_urls(...).thenReturn(
            [verified_url]
        )
        expect(repo, times=1).get_all_url_verifications().thenReturn(flags)

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
    # save_content                                                         #
    # ------------------------------------------------------------------ #

    def test_save_content_no_existing_content_inserts_both(self) -> None:
        """
        Given no content row exists for this URL,
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
        expect(repo, times=1).get_content_by_url(request.url).thenReturn(None)
        expect(repo, times=1).insert_content(expected_data).thenReturn(5)
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
        Given a content row already exists for this URL but no recommendation for this user,
        When save_content is called,
        Then insert_content is NOT called and insert_saved_content is called once.
        """
        # PREPARE
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)
        request = _make_save_request()

        # MOCK
        expect(repo, times=1).get_content_by_url(request.url).thenReturn({"content_id": 5})
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
        expect(repo, times=1).get_content_by_url(request.url).thenReturn({"content_id": 5})
        expect(repo, times=1).get_recommendation_by_content_and_user(
            5, request.user_id
        ).thenReturn({"saving_id": 3})

        # ACT
        asyncio.run(service.save_content(request))

        # ASSERT — verified by expect(times=1); insert_saved_content not set up so not called

    # ------------------------------------------------------------------ #
    # verify_content                                                       #
    # ------------------------------------------------------------------ #

    def test_verify_content_calls_upsert(self) -> None:
        """
        Given a PHYSIOTHERAPIST calls verify with verified=True,
        When verify_content is called,
        Then upsert_url_verification is called with the URL, role, and True.
        """
        # PREPARE
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)
        request = _make_verify_request()

        # MOCK
        expect(repo, times=1).upsert_url_verification(
            request.url, request.user_role, True
        ).thenReturn(None)

        # ACT
        asyncio.run(service.verify_content(request))

        # ASSERT — verified by expect(times=1)

    def test_verify_content_unverify(self) -> None:
        """
        Given verified=False in the request,
        When verify_content is called by a PHYSIOTHERAPIST,
        Then upsert_url_verification is called with value=False to decrement the count.
        """
        # PREPARE
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)
        request = _make_verify_request(verified=False)

        # MOCK
        expect(repo, times=1).upsert_url_verification(
            request.url, request.user_role, False
        ).thenReturn(None)

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
        Given user_role is FITNESS_TRAINER,
        When verify_content is called with verified=True then verified=False,
        Then upsert_url_verification is called with 'FITNESS_TRAINER' and the correct value each time.
        """
        for verified in (True, False):
            # PREPARE
            repo = mock(AiSearchRepository)
            service = AiSearchServices(repository=repo)
            request = _make_verify_request(user_role="FITNESS_TRAINER", user_id="F300", verified=verified)

            # MOCK
            expect(repo, times=1).upsert_url_verification(
                request.url, "FITNESS_TRAINER", verified
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


class ResolveUrlTest(unittest.TestCase):

    def test_non_redirect_url_passes_through(self) -> None:
        """
        Given a regular URL that does not contain the Vertex redirect prefix,
        When _resolve_url is called,
        Then the original URL is returned unchanged and client.head is never called.
        """
        # PREPARE
        client = mock(httpx.AsyncClient)
        url = "https://www.webmd.com/first-aid/rice-method-injuries"

        # MOCK — head must not be called
        expect(client, times=0).head(...)

        # ACT
        result = asyncio.run(_resolve_url(client, url))

        # ASSERT
        self.assertEqual(result, url)

    def test_redirect_url_is_resolved_to_final_destination(self) -> None:
        """
        Given a Vertex AI redirect URL,
        When _resolve_url is called,
        Then client.head is called with that URL and the str of response.url is returned.
        """
        # PREPARE
        client = mock(httpx.AsyncClient)
        redirect_url = f"https://{_VERTEX_REDIRECT_PREFIX}SOMETOKEN=="
        final_url = "https://real.example.com/page"
        mock_response = mock()
        mock_response.url = httpx.URL(final_url)

        # MOCK
        expect(client, times=1).head(redirect_url, timeout=3.0).thenReturn(mock_response)

        # ACT
        result = asyncio.run(_resolve_url(client, redirect_url))

        # ASSERT
        self.assertEqual(result, final_url)

    def test_network_error_returns_empty_string(self) -> None:
        """
        Given a Vertex AI redirect URL and client.head raises httpx.ConnectError,
        When _resolve_url is called,
        Then an empty string is returned so the source is discarded.
        """
        # PREPARE
        client = mock(httpx.AsyncClient)
        redirect_url = f"https://{_VERTEX_REDIRECT_PREFIX}SOMETOKEN=="

        # MOCK
        expect(client, times=1).head(redirect_url, timeout=3.0).thenRaise(
            httpx.ConnectError("connection refused")
        )

        # ACT
        result = asyncio.run(_resolve_url(client, redirect_url))

        # ASSERT
        self.assertEqual(result, "")

    def test_timeout_returns_empty_string(self) -> None:
        """
        Given a Vertex AI redirect URL and client.head raises httpx.TimeoutException,
        When _resolve_url is called,
        Then an empty string is returned so the source is discarded.
        """
        # PREPARE
        client = mock(httpx.AsyncClient)
        redirect_url = f"https://{_VERTEX_REDIRECT_PREFIX}SOMETOKEN=="

        # MOCK
        expect(client, times=1).head(redirect_url, timeout=3.0).thenRaise(
            httpx.TimeoutException("timed out")
        )

        # ACT
        result = asyncio.run(_resolve_url(client, redirect_url))

        # ASSERT
        self.assertEqual(result, "")


class SearchRedirectResolutionTest(unittest.TestCase):

    def test_search_replaces_redirect_url_in_source_card(self) -> None:
        """
        Given Gemini grounding returns a Vertex AI redirect URL for one source,
        And _resolve_grounding_urls resolves it to a real destination URL,
        When search is called,
        Then the returned SourceCard.url is the resolved destination URL.
        """
        # PREPARE
        redirect_url = f"https://{_VERTEX_REDIRECT_PREFIX}EXPIRING_TOKEN=="
        real_url = "https://www.physio-pedia.com/ACL_Reconstruction"
        repo = mock(AiSearchRepository)
        service = AiSearchServices(repository=repo)
        request = _make_search_request()
        mock_client = mock()
        mock_models = mock()
        mock_client.models = mock_models
        gemini_response = _mock_gemini_response(
            sources=[
                {
                    "title": "ACL Reconstruction Guide",
                    "url": redirect_url,
                    "description": "Comprehensive guide to ACL reconstruction.",
                    "content_type": "Article",
                }
            ]
        )

        # MOCK
        expect(repo, times=1).insert_query(
            request.query_text, request.user_id, request.user_role
        ).thenReturn(1)
        expect(genai_module, times=1).Client(...).thenReturn(mock_client)
        expect(mock_models, times=1).generate_content(...).thenReturn(gemini_response)
        expect(ai_search_module, times=1)._resolve_grounding_urls(...).thenReturn(
            [real_url]
        )
        expect(repo, times=1).get_all_url_verifications().thenReturn({})

        # ACT
        result = asyncio.run(service.search(request))

        # ASSERT
        self.assertEqual(len(result.sources), 1)
        self.assertEqual(result.sources[0].url, real_url)
