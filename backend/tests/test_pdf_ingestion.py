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

from app.ingestion.pdf_ingestion import build_documents_for_source


class ProfessorIngestionTests(unittest.TestCase):
    def test_professor_source_produces_single_pessoa_document(self):
        source = {
            "source_id": "prof-angela-moreno",
            "title": "Ângela Leite Moreno",
            "tipo_documento": "professor",
            "public_url": "http://lattes.cnpq.br/1234567890",
            "curso": "Ciência da Computação",
            "tags": ["professor"],
        }
        pages = [
            (
                1,
                "Ângela Leite Moreno\n\n"
                "Unidade:\nInstituto de Ciências Exatas\n\n"
                "Titulação:\nDoutorado\n\n"
                "Resumo no Lattes:\n"
                "Angela Leite Moreno é graduada em Matemática pela UNESP.",
            )
        ]

        documents = build_documents_for_source(source, pages)

        self.assertEqual(len(documents), 1)
        doc = documents[0]
        self.assertEqual(doc["tipo_conteudo"], "pessoa")
        self.assertEqual(doc["tipo_documento"], "professor")
        self.assertEqual(doc["nome_pessoa"], "Ângela Leite Moreno")
        self.assertEqual(doc["unidade"], "Instituto de Ciências Exatas")
        self.assertEqual(doc["titulacao"], "Doutorado")
        self.assertEqual(doc["conteudo"], "Angela Leite Moreno é graduada em Matemática pela UNESP.")
        self.assertEqual(doc["url_documento"], "http://lattes.cnpq.br/1234567890")
        self.assertNotIn("#page=", doc["url_documento"])
        self.assertEqual(doc["document_id"], "prof-angela-moreno-p1")
        self.assertEqual(doc["pagina"], 1)

    def test_non_professor_source_uses_existing_discipline_path(self):
        source = {
            "source_id": "ppc-cc-2023",
            "title": "Projeto Pedagógico",
            "public_url": "https://exemplo.com/doc.pdf",
        }
        pages = [(1, "Disciplina: Cálculo Pré-requisitos: Nenhum C.H Total: 60 Ementa: Derivadas")]

        documents = build_documents_for_source(source, pages)

        self.assertGreater(len(documents), 0)
        self.assertNotEqual(documents[0]["tipo_conteudo"], "pessoa")


if __name__ == "__main__":
    unittest.main()
