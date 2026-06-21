import sys
import types
import unittest

elasticsearch_stub = types.ModuleType("elasticsearch")


class StubElasticsearch:
    def __init__(self, **kwargs):
        self.init_kwargs = kwargs


elasticsearch_stub.Elasticsearch = StubElasticsearch
sys.modules.setdefault("elasticsearch", elasticsearch_stub)

from app.core.config import settings
from app.domain.es_client import EsClient


class FakeElasticsearchClient:
    def __init__(self):
        self.search_kwargs = None

    def search(self, **kwargs):
        self.search_kwargs = kwargs
        return {"hits": {"hits": [], "total": {"value": 0}}}


class EsClientQueryTests(unittest.TestCase):
    def build_client(self):
        es_client = EsClient()
        fake_client = FakeElasticsearchClient()
        es_client.client = fake_client
        return es_client, fake_client

    def test_search_builds_layered_query_with_fuzzy_as_optional_fallback(self):
        es_client, fake_client = self.build_client()

        es_client.search("calculo diferencial", page=2)

        search_kwargs = fake_client.search_kwargs
        self.assertEqual(search_kwargs["index"], settings.index_name)
        self.assertEqual(search_kwargs["from_"], settings.page_size)
        self.assertEqual(search_kwargs["size"], settings.page_size)
        self.assertEqual(search_kwargs["collapse"], {"field": "source_id"})
        self.assertIn("highlight", search_kwargs)

        bool_query = search_kwargs["query"]["bool"]
        self.assertEqual(bool_query["minimum_should_match"], 1)
        should_queries = bool_query["should"]

        phrase_query = should_queries[0]["multi_match"]
        self.assertEqual(phrase_query["type"], "phrase")
        self.assertEqual(phrase_query["query"], "calculo diferencial")
        self.assertGreater(phrase_query["boost"], should_queries[1]["multi_match"]["boost"])

        normal_query = should_queries[1]["multi_match"]
        self.assertEqual(normal_query["fields"], list(settings.boosted_search_fields))
        self.assertEqual(normal_query["type"], "best_fields")

        prefix_query = should_queries[2]["multi_match"]
        self.assertEqual(prefix_query["type"], "bool_prefix")
        self.assertIn("nome_disciplina^3", prefix_query["fields"])

        fuzzy_query = should_queries[3]["multi_match"]
        self.assertEqual(fuzzy_query["fuzziness"], "AUTO")
        self.assertEqual(fuzzy_query["prefix_length"], 2)
        self.assertLessEqual(fuzzy_query["max_expansions"], 25)
        self.assertEqual(fuzzy_query["minimum_should_match"], "2<75%")
        self.assertLess(fuzzy_query["boost"], normal_query["boost"])

    def test_search_preserves_tipo_filter_and_recent_sort(self):
        es_client, fake_client = self.build_client()

        es_client.search("estagio", sort_by="recent", tipo_conteudo="disciplina")

        search_kwargs = fake_client.search_kwargs
        query_body = search_kwargs["query"]

        self.assertEqual(
            query_body["bool"]["filter"],
            {"term": {"tipo_conteudo": "disciplina"}},
        )
        self.assertIn("must", query_body["bool"])
        self.assertEqual(
            search_kwargs["sort"],
            [{"indexado_em": {"order": "desc"}}, "_score"],
        )
        self.assertTrue(search_kwargs["track_scores"])


if __name__ == "__main__":
    unittest.main()
