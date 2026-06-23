import asyncio
import json
from pathlib import Path
import sys
import types
import unittest
from unittest.mock import MagicMock, patch

fake_elasticsearch = types.ModuleType("elasticsearch")
fake_elasticsearch.Elasticsearch = MagicMock()
sys.modules.setdefault("elasticsearch", fake_elasticsearch)

fake_pydantic = types.ModuleType("pydantic")


class BaseModel:
    def __init__(self, **kwargs):
        for name, value in self.__class__.__dict__.items():
            if not name.startswith("_") and not callable(value):
                setattr(self, name, value)
        for name, value in kwargs.items():
            setattr(self, name, value)

    def model_dump(self):
        return dict(self.__dict__)


fake_pydantic.BaseModel = BaseModel
sys.modules.setdefault("pydantic", fake_pydantic)

fake_fastapi = types.ModuleType("fastapi")


class APIRouter:
    def get(self, *args, **kwargs):
        def decorator(func):
            return func

        return decorator


def Query(default, **kwargs):
    return default


fake_fastapi.APIRouter = APIRouter
fake_fastapi.Query = Query
sys.modules.setdefault("fastapi", fake_fastapi)

fake_fastapi_responses = types.ModuleType("fastapi.responses")


class JSONResponse:
    def __init__(self, content):
        self.content = content


fake_fastapi_responses.JSONResponse = JSONResponse
sys.modules.setdefault("fastapi.responses", fake_fastapi_responses)

from app.domain.es_client import EsClient, build_search_suggest, extract_suggested_query
from app.models.result import SearchResponse
from app.services.search_service import SearchService
from app.controllers import search_controller


class SearchSuggestionTests(unittest.TestCase):
    def make_client(self):
        with patch("app.domain.es_client.Elasticsearch"):
            client = EsClient()
        client.client.search = MagicMock(return_value={"hits": {"hits": []}})
        return client

    def test_search_adds_phrase_suggest_only_when_requested(self):
        client = self.make_client()

        client.search("calclo numerico", include_suggestions=True)

        search_kwargs = client.client.search.call_args.kwargs
        self.assertIn("suggest", search_kwargs)
        self.assertEqual(search_kwargs["suggest"], build_search_suggest("calclo numerico"))
        self.assertIn("did_you_mean_nome_disciplina_suggest", search_kwargs["suggest"])
        self.assertNotIn("did_you_mean_conteudo_suggest", search_kwargs["suggest"])
        phrase_suggest = search_kwargs["suggest"]["did_you_mean_nome_disciplina_suggest"]
        self.assertEqual(phrase_suggest["text"], "calclo numerico")
        self.assertEqual(phrase_suggest["phrase"]["field"], "nome_disciplina.suggest")

    def test_mapping_has_display_safe_suggest_subfields_without_conteudo(self):
        mapping_path = Path(__file__).resolve().parents[1] / "elastic" / "unisearch_documentos_mapping.json"
        mapping = json.loads(mapping_path.read_text())

        suggest_analyzer = mapping["settings"]["analysis"]["analyzer"]["unisearch_suggest"]
        self.assertEqual(suggest_analyzer["filter"], ["lowercase", "asciifolding"])

        properties = mapping["mappings"]["properties"]
        for field in ("nome_disciplina", "titulo_documento", "titulo_secao", "nome_pessoa", "ementa"):
            self.assertEqual(
                properties[field]["fields"]["suggest"],
                {"type": "text", "analyzer": "unisearch_suggest"},
            )
        self.assertNotIn("fields", properties["conteudo"])

    def test_search_omits_suggest_by_default_to_preserve_contract_and_cost(self):
        client = self.make_client()

        client.search("calculo")

        search_kwargs = client.client.search.call_args.kwargs
        self.assertNotIn("suggest", search_kwargs)

    def test_build_search_suggest_includes_term_suggesters_for_token_corrections(self):
        suggest = build_search_suggest("calclo numerico")

        term_suggest = suggest["did_you_mean_term_nome_disciplina_suggest"]
        self.assertEqual(term_suggest["text"], "calclo numerico")
        self.assertEqual(term_suggest["term"]["field"], "nome_disciplina.suggest")
        self.assertEqual(term_suggest["term"]["suggest_mode"], "missing")

    def test_extract_suggested_query_uses_readable_term_corrections_with_fuzzy_hits(self):
        response = {
            "suggest": {
                "did_you_mean_term_nome_disciplina_suggest": [
                    {
                        "text": "calclo",
                        "offset": 0,
                        "length": 6,
                        "options": [{"text": "calculo", "score": 0.83, "freq": 6}],
                    },
                    {"text": "numerico", "offset": 7, "length": 8, "options": []},
                ]
            }
        }

        self.assertEqual(
            extract_suggested_query(response, "calclo numerico", total=3, max_score=42.0),
            "calculo numerico",
        )

    def test_extract_suggested_query_prioritizes_important_fields_over_ementa(self):
        response = {
            "suggest": {
                "did_you_mean_term_ementa_suggest": [
                    {
                        "text": "daddos",
                        "offset": 6,
                        "length": 6,
                        "options": [{"text": "dados", "score": 0.8, "freq": 24}],
                    },
                    {
                        "text": "numerico",
                        "offset": 7,
                        "length": 8,
                        "options": [{"text": "numericos", "score": 0.87, "freq": 4}],
                    },
                ],
                "did_you_mean_term_nome_disciplina_suggest": [
                    {
                        "text": "daddos",
                        "offset": 6,
                        "length": 6,
                        "options": [{"text": "dados", "score": 0.8, "freq": 7}],
                    },
                    {
                        "text": "calclo",
                        "offset": 0,
                        "length": 6,
                        "options": [{"text": "calculo", "score": 0.83, "freq": 6}],
                    },
                ],
            }
        }

        self.assertEqual(
            extract_suggested_query(response, "banco daddos", total=6, max_score=30.0),
            "banco dados",
        )
        self.assertEqual(
            extract_suggested_query(response, "calclo numerico", total=3, max_score=42.0),
            "calculo numerico",
        )

    def test_extract_suggested_query_allows_ementa_when_multiple_tokens_are_corrected(self):
        response = {
            "suggest": {
                "did_you_mean_term_ementa_suggest": [
                    {
                        "text": "eqacoes",
                        "offset": 0,
                        "length": 7,
                        "options": [{"text": "equacoes", "score": 0.85, "freq": 3}],
                    },
                    {
                        "text": "polinomias",
                        "offset": 8,
                        "length": 10,
                        "options": [{"text": "polinomiais", "score": 0.9, "freq": 2}],
                    },
                ]
            }
        }

        self.assertEqual(
            extract_suggested_query(response, "eqacoes polinomias", total=2, max_score=10.0),
            "equacoes polinomiais",
        )

    def test_extract_suggested_query_keeps_good_or_low_confidence_queries_null(self):
        good_query_response = {
            "suggest": {
                "did_you_mean_term_ementa_suggest": [
                    {"text": "calculo", "offset": 0, "length": 7, "options": []},
                    {
                        "text": "numerico",
                        "offset": 8,
                        "length": 8,
                        "options": [{"text": "numerica", "score": 0.87, "freq": 2}],
                    },
                ],
                "did_you_mean_nome_disciplina_suggest": [
                    {"options": [{"text": "calculo numerico", "score": 0.01}]}
                ],
            }
        }
        nonsense_response = {
            "suggest": {
                "did_you_mean_term_ementa_suggest": [
                    {
                        "text": "xpto",
                        "offset": 0,
                        "length": 4,
                        "options": [{"text": "xpath", "score": 0.5, "freq": 1}],
                    }
                ]
            }
        }

        self.assertIsNone(
            extract_suggested_query(good_query_response, "calculo numerico", total=3, max_score=42.0)
        )
        self.assertIsNone(
            extract_suggested_query(nonsense_response, "xpto blargle zzz", total=0, max_score=0.0)
        )

    def test_extract_suggested_query_uses_phrase_suggestion_for_zero_results_fallback(self):
        response = {
            "suggest": {
                "did_you_mean_nome_disciplina_suggest": [
                    {"options": [{"text": "calculo numerico", "score": 0.8}]}
                ],
                "did_you_mean_titulo_secao_suggest": [
                    {"options": [{"text": "calculo numérico", "score": 0.5}]}
                ],
            }
        }

        self.assertEqual(
            extract_suggested_query(response, "calclo numerico", total=0, max_score=0.0),
            "calculo numerico",
        )
        self.assertIsNone(
            extract_suggested_query(
                {
                    "suggest": {
                        "did_you_mean_nome_disciplina_suggest": [
                            {"options": [{"text": "xpto blargl zzz", "score": 0.0004}]}
                        ]
                    }
                },
                "xpto blargle zzz",
                total=0,
                max_score=0.0,
            )
        )

    def test_service_default_returns_original_search_response_without_suggested_query(self):
        service = SearchService.__new__(SearchService)
        service.es_client = MagicMock()
        service.es_client.search.return_value = {
            "hits": {"total": {"value": 0}, "max_score": None, "hits": []}
        }

        result = service.submit_query("calculo")

        self.assertIsInstance(result, SearchResponse)
        self.assertFalse(hasattr(result, "suggested_query"))
        service.es_client.search.assert_called_once_with("calculo", 1, "relevance", "", False)

    def test_service_returns_suggested_query_payload_only_when_requested(self):
        service = SearchService.__new__(SearchService)
        service.es_client = MagicMock()
        service.es_client.search.return_value = {
            "hits": {"total": {"value": 0}, "max_score": None, "hits": []},
            "suggest": {
                "did_you_mean_nome_disciplina_suggest": [
                    {"options": [{"text": "calculo numerico", "score": 0.8}]}
                ]
            },
        }

        result = service.submit_query("calclo numerico", include_suggestions=True)

        self.assertIsInstance(result, dict)
        self.assertEqual(result["suggested_query"], "calculo numerico")
        self.assertEqual(result["results"], [])
        self.assertEqual(result["total"], 0)
        service.es_client.search.assert_called_once_with("calclo numerico", 1, "relevance", "", True)

    def test_controller_preserves_default_response_and_returns_json_when_suggestions_requested(self):
        original_service = search_controller.search_service
        fake_service = MagicMock()
        search_controller.search_service = fake_service

        try:
            default_response = SearchResponse(results=[], total=0, max_score=0.0, page=1, sort_by="relevance")
            fake_service.submit_query.return_value = default_response

            result = asyncio.run(
                search_controller.search(
                    query="calculo",
                    page=1,
                    sort_by="relevance",
                    tipo="",
                    include_suggestions=False,
                )
            )

            self.assertIs(result, default_response)
            fake_service.submit_query.assert_called_with("calculo", 1, "relevance", "", False)

            payload = {
                "results": [],
                "total": 0,
                "max_score": 0.0,
                "page": 1,
                "sort_by": "relevance",
                "suggested_query": "calculo numerico",
            }
            fake_service.reset_mock()
            fake_service.submit_query.return_value = payload

            result = asyncio.run(
                search_controller.search(
                    query="calclo numerico",
                    page=1,
                    sort_by="relevance",
                    tipo="disciplina",
                    include_suggestions=True,
                )
            )

            self.assertEqual(result.content, payload)
            fake_service.submit_query.assert_called_with("calclo numerico", 1, "relevance", "disciplina", True)
        finally:
            search_controller.search_service = original_service


if __name__ == "__main__":
    unittest.main()
