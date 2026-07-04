import sys
import types
import unittest
from pathlib import Path
from unittest.mock import MagicMock

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

fake_elasticsearch = types.ModuleType("elasticsearch")
fake_elasticsearch.Elasticsearch = MagicMock()
sys.modules.setdefault("elasticsearch", fake_elasticsearch)

fake_elasticsearch_helpers = types.ModuleType("elasticsearch.helpers")
fake_elasticsearch_helpers.bulk = MagicMock()
sys.modules.setdefault("elasticsearch.helpers", fake_elasticsearch_helpers)

fake_pypdf = types.ModuleType("pypdf")
fake_pypdf.PdfReader = MagicMock()
sys.modules.setdefault("pypdf", fake_pypdf)

from app.ingestion.professor_parser import parse_professor_text


class ProfessorParserTests(unittest.TestCase):
    def test_parse_extracts_all_fields(self):
        text = (
            "Ângela Leite Moreno\n\n"
            "Unidade:\nInstituto de Ciências Exatas\n\n"
            "Titulação:\nDoutorado\n\n"
            "Resumo no Lattes:\n"
            "Angela Leite Moreno é graduada em Matemática pela UNESP."
        )
        result = parse_professor_text(text)
        self.assertEqual(result["nome_pessoa"], "Ângela Leite Moreno")
        self.assertEqual(result["unidade"], "Instituto de Ciências Exatas")
        self.assertEqual(result["titulacao"], "Doutorado")
        self.assertEqual(
            result["conteudo"],
            "Angela Leite Moreno é graduada em Matemática pela UNESP."
        )

    def test_parse_strips_whitespace_from_fields(self):
        text = (
            "  João Silva  \n\n"
            "Unidade:\n  Instituto de Ciências da Atmosfera  \n\n"
            "Titulação:\n  Mestrado  \n\n"
            "Resumo no Lattes:\n  Pesquisador na área de meteorologia.  "
        )
        result = parse_professor_text(text)
        self.assertEqual(result["nome_pessoa"], "João Silva")
        self.assertEqual(result["unidade"], "Instituto de Ciências da Atmosfera")
        self.assertEqual(result["titulacao"], "Mestrado")
        self.assertEqual(result["conteudo"], "Pesquisador na área de meteorologia.")

    def test_parse_handles_multiline_resumo(self):
        text = (
            "Maria Santos\n\n"
            "Unidade:\nInstituto de Matemática\n\n"
            "Titulação:\nDoutorado\n\n"
            "Resumo no Lattes:\n"
            "Linha 1 do resumo.\n"
            "Linha 2 do resumo.\n"
            "Linha 3 do resumo."
        )
        result = parse_professor_text(text)
        self.assertIn("Linha 1 do resumo.", result["conteudo"])
        self.assertIn("Linha 2 do resumo.", result["conteudo"])
        self.assertIn("Linha 3 do resumo.", result["conteudo"])

    def test_parse_returns_empty_strings_for_missing_sections(self):
        text = "Apenas um nome sem seções"
        result = parse_professor_text(text)
        self.assertEqual(result["nome_pessoa"], "Apenas um nome sem seções")
        self.assertEqual(result["unidade"], "")
        self.assertEqual(result["titulacao"], "")
        self.assertEqual(result["conteudo"], "")


if __name__ == "__main__":
    unittest.main()
