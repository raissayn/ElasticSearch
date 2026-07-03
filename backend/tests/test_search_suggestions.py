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
        for cls in reversed(self.__class__.mro()):
            for name in getattr(cls, "__annotations__", {}):
                if name in cls.__dict__ and not name.startswith("_"):
                    setattr(self, name, cls.__dict__[name])
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

    def test_extract_suggested_query_preserves_punctuation(self):
        response = {
            "suggest": {
                "did_you_mean_term_nome_disciplina_suggest": [
                    {
                        "text": "calclo",
                        "offset": 0,
                        "length": 6,
                        "options": [{"text": "calculo", "score": 0.83, "freq": 6}],
                    }
                ]
            }
        }

        self.assertEqual(
            extract_suggested_query(response, "calclo, numerico!", total=3, max_score=42.0),
            "calculo, numerico!",
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
                        "options": [],
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
                    {
                        "text": "numerico",
                        "offset": 7,
                        "length": 8,
                        "options": [],
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

    def test_search_response_contract_declares_optional_suggested_query(self):
        self.assertIn("suggested_query", SearchResponse.__annotations__)
        self.assertIsNone(SearchResponse(results=[]).suggested_query)

    def test_service_default_returns_search_response_with_null_suggested_query(self):
        service = SearchService.__new__(SearchService)
        service.es_client = MagicMock()
        service.es_client.search.return_value = {
            "hits": {"total": {"value": 0}, "max_score": None, "hits": []}
        }

        result = service.submit_query("calculo")

        self.assertIsInstance(result, SearchResponse)
        self.assertIsNone(result.suggested_query)
        service.es_client.search.assert_called_once_with("calculo", 1, "relevance", "", False)

    def test_service_returns_search_response_with_suggested_query_only_when_requested(self):
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

        self.assertIsInstance(result, SearchResponse)
        self.assertEqual(result.suggested_query, "calculo numerico")
        self.assertEqual(result.results, [])
        self.assertEqual(result.total, 0)
        service.es_client.search.assert_called_once_with("calclo numerico", 1, "relevance", "", True)

    def test_service_deduplicates_same_discipline_across_sources(self):
        service = SearchService.__new__(SearchService)
        service.es_client = MagicMock()
        service.es_client.search.return_value = {
            "hits": {
                "total": {"value": 2},
                "max_score": 10.0,
                "hits": [
                    {
                        "_score": 10.0,
                        "_source": {
                            "document_id": "ppc-cc-2020-p39-d2",
                            "source_id": "ppc-cc-2020",
                            "tipo_conteudo": "disciplina",
                            "nome_disciplina": "Programação Lógica",
                            "curso": "Ciência da Computação",
                            "ementa": "Representação do Conhecimento",
                        },
                    },
                    {
                        "_score": 8.0,
                        "_source": {
                            "document_id": "projeto-pedagogico-p39-d2",
                            "source_id": "projeto-pedagogico",
                            "tipo_conteudo": "disciplina",
                            "nome_disciplina": "Programação Lógica",
                            "curso": "Ciência da Computação",
                            "ementa": "Representação do Conhecimento",
                        },
                    },
                ],
            }
        }

        result = service.submit_query("Programação Lógica")

        self.assertEqual(len(result.results), 1)
        self.assertEqual(result.total, 1)
        self.assertEqual(result.results[0].document_id, "ppc-cc-2020-p39-d2")

    def test_service_keeps_summary_when_highlight_is_only_from_title_fields(self):
        service = SearchService.__new__(SearchService)
        service.es_client = MagicMock()
        service.es_client.search.return_value = {
            "hits": {
                "total": {"value": 1},
                "max_score": 10.0,
                "hits": [
                    {
                        "_score": 10.0,
                        "_source": {
                            "document_id": "ppc-cc-2020-p39-d2",
                            "source_id": "ppc-cc-2020",
                            "tipo_conteudo": "disciplina",
                            "nome_disciplina": "Programação Lógica",
                            "curso": "Ciência da Computação",
                            "ementa": "Representação do Conhecimento",
                        },
                        "highlight": {
                            "nome_disciplina": ["<mark>Programação</mark> Lógica"]
                        },
                    }
                ],
            }
        }

        result = service.submit_query("Programação Lógica")

        self.assertEqual(result.results[0].ementa, "Representação do Conhecimento")
        self.assertIsNone(result.results[0].highlight)

    def test_controller_returns_model_compatible_payload_for_fastapi_validation(self):
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

            self.assertEqual(result, payload)
            self.assertFalse(hasattr(result, "content"))
            fake_service.submit_query.assert_called_with("calclo numerico", 1, "relevance", "disciplina", True)
        finally:
            search_controller.search_service = original_service

    def test_restore_accents_from_response(self):
        from app.domain.es_client import restore_accents_from_response
        response = {
            "hits": {
                "hits": [
                    {
                        "_source": {
                            "nome_disciplina": "Programação Funcional",
                            "ementa": "Cálculo e Álgebra",
                        }
                    }
                ]
            }
        }
        self.assertEqual(restore_accents_from_response("programacao", response), "programação")
        self.assertEqual(restore_accents_from_response("Programacao", response), "Programação")
        self.assertEqual(restore_accents_from_response("calculo e programacao!", response), "cálculo e programação!")


if __name__ == "__main__":
    unittest.main()
