import unittest
import sys
import types
from unittest.mock import MagicMock, patch

fake_elasticsearch = types.ModuleType("elasticsearch")
fake_elasticsearch.Elasticsearch = MagicMock()
sys.modules.setdefault("elasticsearch", fake_elasticsearch)

from app.domain.es_client import EsClient


class EsClientQueryTests(unittest.TestCase):
    def make_client(self):
        with patch("app.domain.es_client.Elasticsearch"):
            client = EsClient()
        client.client.search = MagicMock(return_value={"hits": {"hits": []}})
        return client

    def test_search_builds_layered_fuzzy_query_for_typos_and_incomplete_terms(self):
        client = self.make_client()

        client.search("progamação orintada", page=2)

        search_kwargs = client.client.search.call_args.kwargs
        self.assertEqual(search_kwargs["from_"], 10)

        should_clauses = search_kwargs["query"]["bool"]["should"]
        clause_names = {
            clause.get("multi_match", {}).get("_name")
            or clause.get("dis_max", {}).get("_name")
            for clause in should_clauses
        }

        self.assertIn("exact_boosted_fields", clause_names)
        self.assertIn("controlled_fuzzy_fields", clause_names)
        self.assertIn("important_prefix_fields", clause_names)

        fuzzy_clause = next(
            clause["multi_match"]
            for clause in should_clauses
            if clause.get("multi_match", {}).get("_name") == "controlled_fuzzy_fields"
        )
        self.assertEqual(fuzzy_clause["fuzziness"], "AUTO:4,7")
        self.assertEqual(fuzzy_clause["operator"], "and")
        self.assertEqual(fuzzy_clause["minimum_should_match"], "75%")
        self.assertEqual(fuzzy_clause["prefix_length"], 1)
        self.assertEqual(fuzzy_clause["max_expansions"], 30)
        self.assertTrue(fuzzy_clause["fuzzy_transpositions"])

        prefix_clause = next(
            clause["dis_max"]
            for clause in should_clauses
            if clause.get("dis_max", {}).get("_name") == "important_prefix_fields"
        )
        prefix_fields = {
            match_clause["match_phrase_prefix"].keys().__iter__().__next__()
            for match_clause in prefix_clause["queries"]
        }
        self.assertIn("nome_disciplina", prefix_fields)
        self.assertIn("titulo_documento", prefix_fields)
        self.assertIn("titulo_secao", prefix_fields)

    def test_search_preserves_filter_sort_and_collapse(self):
        client = self.make_client()

        client.search("calculo", sort_by="recent", tipo_conteudo="disciplina")

        search_kwargs = client.client.search.call_args.kwargs
        self.assertEqual(search_kwargs["collapse"], {"field": "source_id"})
        self.assertEqual(
            search_kwargs["query"]["bool"]["filter"],
            {"term": {"tipo_conteudo": "disciplina"}},
        )
        self.assertEqual(
            search_kwargs["sort"],
            [{"indexado_em": {"order": "desc"}}, "_score"],
        )
        self.assertTrue(search_kwargs["track_scores"])


if __name__ == "__main__":
    unittest.main()
