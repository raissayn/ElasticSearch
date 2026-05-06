import json
from pathlib import Path

from app.ingestion.pdf_ingestion import (
    build_documents_for_source,
    build_page_url,
    load_manifest,
)


def test_build_page_url_appends_pdf_anchor():
    url = build_page_url("https://example.edu/ppc.pdf", 40)
    assert url == "https://example.edu/ppc.pdf#page=40"


def test_load_manifest_requires_mandatory_fields():
    manifest_path = Path(__file__).resolve().parent / "manifest_missing_fields.json"
    manifest_path.write_text(json.dumps({"documents": [{"title": "Sem source_id"}]}), encoding="utf-8")

    try:
        try:
            load_manifest(manifest_path)
        except ValueError as exc:
            assert "missing fields" in str(exc)
        else:
            raise AssertionError("Expected ValueError for missing required fields.")
    finally:
        manifest_path.unlink(missing_ok=True)


def test_build_documents_detects_discipline_chunks():
    source = {
        "source_id": "ppc-cc-2023",
        "title": "Projeto Pedagógico Ciência da Computação",
        "doc_type": "ppc",
        "course_name": "Ciência da Computação",
        "academic_year": 2023,
        "local_path": "C:/tmp/ppc.pdf",
        "public_url": "https://example.edu/ppc.pdf",
        "tags": ["ppc"],
    }
    page_text = (
        "QUARTO PERÍODO "
        "Disciplina: Banco de Dados "
        "Pré-requisitos: AEDs II "
        "C.H Total: 60 Teórica: 30 Prática: 30 Hora Atividade: -- "
        "Ementa: Álgebra relacional e projeto lógico. "
        "Disciplina: Computação Gráfica "
        "Pré-requisitos: -- "
        "C.H Total: 60 Teórica: 30 Prática: 30 Hora Atividade: -- "
        "Ementa: Modelagem e transformações geométricas."
    )

    documents = build_documents_for_source(source, [(40, page_text)])

    assert len(documents) == 2
    assert documents[0]["chunk_type"] == "discipline_syllabus"
    assert documents[0]["discipline_name"] == "Banco de Dados"
    assert documents[0]["url"] == "https://example.edu/ppc.pdf#page=40"
    assert documents[0]["workload_total"] == 60
    assert documents[0]["prerequisites"] == ["AEDs II"]
    assert documents[1]["discipline_name"] == "Computação Gráfica"
