import sys
import types
import unittest
from unittest.mock import MagicMock

# pdf_ingestion imports elasticsearch at module load time. Stub it (and the
# helpers submodule) so the test stays hermetic and survives import-order quirks
# when other test modules inject a non-package fake into sys.modules.
fake_elasticsearch = types.ModuleType("elasticsearch")
fake_elasticsearch.Elasticsearch = MagicMock()
fake_helpers = types.ModuleType("elasticsearch.helpers")
fake_helpers.bulk = MagicMock()
fake_elasticsearch.helpers = fake_helpers
sys.modules.setdefault("elasticsearch", fake_elasticsearch)
sys.modules.setdefault("elasticsearch.helpers", fake_helpers)

from app.ingestion.pdf_ingestion import (
    PAGE_SEPARATOR,
    build_documents_for_source,
    merge_pages,
    page_at_offset,
    strip_boilerplate,
    trim_last_discipline_body,
)


FOOTER_40 = "Projeto Pedagógico (1008875) SEI 23087.009983/2022-56 / pg. 40"


def footer(page: int) -> str:
    return FOOTER_40.replace("pg. 40", f"pg. {page}")


def make_source(**overrides):
    base = {
        "source_id": "ppc-cc-2023",
        "title": "PPC CC 2023",
        "curso": "Ciência da Computação",
        "instituicao": "UNIFAL-MG",
        "ano_vigencia": 2023,
        "local_path": "app/data/pdfs/x.pdf",
        "public_url": "https://exemplo.test/x.pdf",
        "tags": ["ppc"],
    }
    base.update(overrides)
    return base


class StripBoilerplateTests(unittest.TestCase):
    def test_removes_sei_footer(self):
        text = f"Ementa: Foo bar. {FOOTER_40} Disciplina: X"
        cleaned = strip_boilerplate(text)
        self.assertNotIn("SEI", cleaned)
        self.assertNotIn("Projeto Pedagógico", cleaned)
        self.assertIn("Ementa: Foo bar.", cleaned)
        self.assertIn("Disciplina: X", cleaned)

    def test_text_without_footer_is_unchanged(self):
        self.assertEqual(strip_boilerplate("Ementa: Foo"), "Ementa: Foo")


class MergePagesTests(unittest.TestCase):
    def test_separator_positions_map_to_pages(self):
        merged, numbers = merge_pages([(1, "a"), (2, "b"), (3, "c")])
        self.assertEqual(merged, f"a{PAGE_SEPARATOR}b{PAGE_SEPARATOR}c")
        self.assertEqual(numbers, [1, 2, 3])
        self.assertEqual(page_at_offset(merged, numbers, 0), 1)
        self.assertEqual(page_at_offset(merged, numbers, merged.index("b")), 2)
        self.assertEqual(page_at_offset(merged, numbers, merged.index("c")), 3)


class TrimLastDisciplineBodyTests(unittest.TestCase):
    def test_trims_at_first_page_boundary_after_ementa(self):
        body = (
            "Pré-requisitos: C.H Total: 60 Ementa: Foo. "
            + FOOTER_40
            + PAGE_SEPARATOR
            + "IV. Desenvolvimento Metodológico"
        )
        trimmed = trim_last_discipline_body(body)
        self.assertIn("Ementa: Foo", trimmed)
        self.assertNotIn("Regulamento", trimmed)
        self.assertNotIn(PAGE_SEPARATOR, trimmed)

    def test_without_ementa_is_unchanged(self):
        body = "Pré-requisitos: C.H Total: 60"
        self.assertEqual(trim_last_discipline_body(body), body)

    def test_without_page_boundary_is_unchanged(self):
        body = "Pré-requisitos: C.H Total: 60 Ementa: Foo."
        self.assertEqual(trim_last_discipline_body(body), body)


class BuildDocumentsForSourceTests(unittest.TestCase):
    def test_single_page_discipline_keeps_full_ementa_without_footer(self):
        pages = [(
            9,
            "Disciplina: Estatística Básica Pré-requisitos: C.H Total: 60 Teórica: 60 Prática: -- "
            "Hora Atividade: -- Ementa: Descrição e exploração de dados; Probabilidades. " + footer(9),
        )]
        docs = build_documents_for_source(make_source(), pages)

        self.assertEqual(len(docs), 1)
        disc = docs[0]
        self.assertEqual(disc["tipo_conteudo"], "disciplina")
        self.assertEqual(disc["nome_disciplina"], "Estatística Básica")
        self.assertEqual(disc["pagina"], 9)
        self.assertEqual(disc["carga_horaria_total"], 60)
        self.assertEqual(disc["carga_horaria_teorica"], 60)
        self.assertIn("Probabilidades", disc["ementa"])
        self.assertNotIn("SEI", disc["ementa"])
        self.assertNotIn("SEI", disc["conteudo"])
        self.assertIn("#page=9", disc["url_documento"])

    def test_cut_discipline_spans_pages_with_full_ementa(self):
        pages = [
            (
                40,
                "QUARTO PERÍODO Disciplina: Gestão do Ciclo de Vida da Aplicação Pré-requisitos: "
                "C.H Total: 90 Teórica: 60 Prática: 30 Hora Atividade: -- " + footer(40),
            ),
            (
                41,
                "27 Ementa: Introdução à gestão do ciclo de vida; Processos de desenvolvimento; "
                "Padrões de projetos. Disciplina: Teoria de Linguagens e Compiladores Pré-requisitos: "
                "C.H Total: 90 Teórica: 60 Prática: 30 Hora Atividade: -- Ementa: Linguagens regulares; "
                "Autômatos finitos. " + footer(41),
            ),
        ]
        docs = build_documents_for_source(make_source(), pages)
        disciplinas = [d for d in docs if d["tipo_conteudo"] == "disciplina"]
        self.assertEqual(len(disciplinas), 2)

        gestao = next(d for d in disciplinas if "Gestão" in d["nome_disciplina"])
        self.assertEqual(gestao["nome_disciplina"], "Gestão do Ciclo de Vida da Aplicação")
        self.assertEqual(gestao["pagina"], 40)
        self.assertEqual(gestao["carga_horaria_total"], 90)
        self.assertIn("Introdução à gestão do ciclo de vida", gestao["ementa"])
        self.assertIn("Padrões de projetos", gestao["ementa"])
        self.assertNotIn("SEI", gestao["ementa"])
        self.assertNotIn("SEI", gestao["conteudo"])
        self.assertNotIn("Teoria de Linguagens", gestao["conteudo"])

        teoria = next(d for d in disciplinas if "Teoria" in d["nome_disciplina"])
        self.assertIn("Linguagens regulares", teoria["ementa"])
        self.assertNotIn("SEI", teoria["conteudo"])

        # The cut continuation page must not leak as a secao_texto.
        self.assertEqual([d for d in docs if d["tipo_conteudo"] == "secao_texto"], [])

    def test_last_discipline_does_not_absorb_trailing_regulamento(self):
        pages = [
            (
                44,
                "Disciplina: Redes Neurais Artificiais Pré-requisitos: C.H Total: 60 Teórica: 60 "
                "Prática: -- Hora Atividade: -- Ementa: Introdução à Inteligência Artificial "
                "Conexionista; Perceptron; Backpropagation. " + footer(44),
            ),
            (
                45,
                "IV. Desenvolvimento Metodológico A metodologia do ensino deve ser flexível. " + footer(45),
            ),
        ]
        docs = build_documents_for_source(make_source(), pages)
        disciplinas = [d for d in docs if d["tipo_conteudo"] == "disciplina"]
        secoes = [d for d in docs if d["tipo_conteudo"] == "secao_texto"]

        self.assertEqual(len(disciplinas), 1)
        self.assertEqual(len(secoes), 1)

        redes = disciplinas[0]
        self.assertIn("Backpropagation", redes["ementa"])
        self.assertNotIn("Metodológico", redes["conteudo"])
        self.assertNotIn("SEI", redes["conteudo"])

        regulamento = secoes[0]
        self.assertEqual(regulamento["pagina"], 45)
        self.assertIn("SEI", regulamento["conteudo"])
        self.assertIn("Metodológico", regulamento["conteudo"])

    def test_pure_regulamento_page_keeps_sei_searchable(self):
        pages = [(
            45,
            "IV. Desenvolvimento Metodológico A metodologia do ensino deve ser flexível. " + footer(45),
        )]
        docs = build_documents_for_source(make_source(), pages)
        self.assertEqual(len(docs), 1)
        sec = docs[0]
        self.assertEqual(sec["tipo_conteudo"], "secao_texto")
        self.assertEqual(sec["pagina"], 45)
        self.assertIn("SEI", sec["conteudo"])
        self.assertIn("Metodológico", sec["conteudo"])


if __name__ == "__main__":
    unittest.main()
