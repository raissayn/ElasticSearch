from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
from pypdf import PdfReader

from app.core.config import settings

try:
    import pdfplumber
except ImportError:  # pragma: no cover - optional runtime dependency fallback
    pdfplumber = None


DISCIPLINE_PATTERN = re.compile(
    r"Disciplina:\s*(?P<discipline>.*?)\s+Pr[ée]-?requisitos:\s*(?P<body>.*?)(?=\s+Disciplina:|\Z)",
    flags=re.IGNORECASE | re.DOTALL,
)
PERIOD_PATTERN = re.compile(
    r"(PRIMEIRO|SEGUNDO|TERCEIRO|QUARTO|QUINTO|SEXTO|S[ÉE]TIMO|OITAVO)\s+PER[ÍI]ODO",
    flags=re.IGNORECASE,
)


def load_manifest(manifest_path: Path) -> list[dict[str, Any]]:
    with manifest_path.open("r", encoding="utf-8") as file:
        payload = json.load(file)

    documents = payload.get("documents", [])
    if not isinstance(documents, list) or not documents:
        raise ValueError("Manifest must contain a non-empty 'documents' list.")

    required = {"source_id", "title", "local_path", "public_url"}
    normalized: list[dict[str, Any]] = []
    for doc in documents:
        missing = required.difference(doc.keys())
        if missing:
            raise ValueError(f"Manifest item missing fields: {sorted(missing)}")
        normalized.append(doc)
    return normalized


def extract_pages(pdf_path: Path) -> list[tuple[int, str]]:
    if pdfplumber:
        with pdfplumber.open(pdf_path) as pdf:
            pages = [
                (index + 1, normalize_text(page.extract_text() or ""))
                for index, page in enumerate(pdf.pages)
            ]
    else:
        reader = PdfReader(str(pdf_path))
        pages = [
            (index + 1, normalize_text(page.extract_text() or ""))
            for index, page in enumerate(reader.pages)
        ]

    return [(page, text) for page, text in pages if text]


def normalize_text(content: str) -> str:
    content = content.replace("\x00", " ")
    content = re.sub(r"\s+", " ", content)
    return content.strip()


def build_page_url(base_url: str, page_number: int) -> str:
    return f"{base_url}#page={page_number}"


def build_documents_for_source(source: dict[str, Any], pages: list[tuple[int, str]]) -> list[dict[str, Any]]:
    local_path = Path(source["local_path"])
    source_tags = source.get("tags") or []
    source_id = str(source["source_id"])
    public_url = str(source["public_url"])
    now_iso = datetime.now(timezone.utc).isoformat()

    documents: list[dict[str, Any]] = []
    for page_number, page_text in pages:
        period_match = PERIOD_PATTERN.search(page_text)
        period = period_match.group(1).title() if period_match else source.get("period", "")
        discipline_chunks = list(DISCIPLINE_PATTERN.finditer(page_text))

        if discipline_chunks:
            for chunk_index, chunk in enumerate(discipline_chunks, start=1):
                discipline_name = normalize_text(chunk.group("discipline"))
                body = normalize_text(chunk.group("body"))
                prerequisites = extract_prerequisites(body)
                summary = extract_summary(body)
                workloads = extract_workload(body)
                document_id = f"{source_id}-p{page_number}-d{chunk_index}"
                documents.append(
                    {
                        "document_id": document_id,
                        "source_id": source_id,
                        "doc_type": source.get("doc_type", "documento_academico"),
                        "chunk_type": "discipline_syllabus",
                        "title": source["title"],
                        "section_title": f"{discipline_name} - Página {page_number}",
                        "content": body,
                        "summary": summary,
                        "searchable_text": " ".join(
                            [
                                source["title"],
                                discipline_name,
                                summary,
                                body,
                                source.get("course_name", ""),
                            ]
                        ).strip(),
                        "url": build_page_url(public_url, page_number),
                        "source_file": local_path.name,
                        "source_path": str(local_path),
                        "course_name": source.get("course_name", ""),
                        "academic_year": source.get("academic_year"),
                        "period": period,
                        "discipline_name": discipline_name,
                        "prerequisites": prerequisites,
                        "workload_total": workloads["total"],
                        "workload_theoretical": workloads["theoretical"],
                        "workload_practical": workloads["practical"],
                        "workload_activity": workloads["activity"],
                        "page_start": page_number,
                        "page_end": page_number,
                        "chunk_index": chunk_index,
                        "tags": list(set(source_tags + ["ementa"])),
                        "ingested_at": now_iso,
                    }
                )
        else:
            document_id = f"{source_id}-p{page_number}"
            summary = extract_summary(page_text)
            documents.append(
                {
                    "document_id": document_id,
                    "source_id": source_id,
                    "doc_type": source.get("doc_type", "documento_academico"),
                    "chunk_type": "page_text",
                    "title": source["title"],
                    "section_title": f"Página {page_number}",
                    "content": page_text,
                    "summary": summary,
                    "searchable_text": " ".join(
                        [
                            source["title"],
                            summary,
                            page_text,
                            source.get("course_name", ""),
                        ]
                    ).strip(),
                    "url": build_page_url(public_url, page_number),
                    "source_file": local_path.name,
                    "source_path": str(local_path),
                    "course_name": source.get("course_name", ""),
                    "academic_year": source.get("academic_year"),
                    "period": period,
                    "discipline_name": "",
                    "prerequisites": [],
                    "workload_total": None,
                    "workload_theoretical": None,
                    "workload_practical": None,
                    "workload_activity": None,
                    "page_start": page_number,
                    "page_end": page_number,
                    "chunk_index": 1,
                    "tags": source_tags,
                    "ingested_at": now_iso,
                }
            )

    return documents


def extract_summary(content: str, limit: int = 420) -> str:
    ementa_match = re.search(r"Ementa:\s*(.+)", content, flags=re.IGNORECASE)
    if ementa_match:
        summary = ementa_match.group(1)
    else:
        summary = content
    return normalize_text(summary)[:limit]


def extract_workload(content: str) -> dict[str, int | None]:
    return {
        "total": parse_numeric_field(content, r"C\.H\s*Total:\s*([0-9]+)"),
        "theoretical": parse_numeric_field(content, r"Te[óo]rica:\s*([0-9]+)"),
        "practical": parse_numeric_field(content, r"Pr[áa]tica:\s*([0-9]+)"),
        "activity": parse_numeric_field(content, r"Hora\s*Atividade:\s*([0-9]+)"),
    }


def parse_numeric_field(content: str, pattern: str) -> int | None:
    match = re.search(pattern, content, flags=re.IGNORECASE)
    if not match:
        return None
    return int(match.group(1))


def extract_prerequisites(content: str) -> list[str]:
    match = re.search(
        r"Pr[ée]-?requisitos:\s*(.*?)\s*(C\.H\s*Total:|Ementa:)",
        content,
        flags=re.IGNORECASE | re.DOTALL,
    )
    if match:
        raw = normalize_text(match.group(1))
    else:
        fallback = re.search(r"^(.*?)\s*(C\.H\s*Total:|Ementa:)", content, flags=re.IGNORECASE | re.DOTALL)
        raw = normalize_text(fallback.group(1)) if fallback else ""

    if not raw or raw in {"-", "--", "Não", "N/A"}:
        return []
    return [item.strip() for item in raw.split(",") if item.strip()]


def index_documents(client: Elasticsearch, index_name: str, documents: list[dict[str, Any]]) -> tuple[int, list]:
    actions = (
        {
            "_index": index_name,
            "_id": document["document_id"],
            "_source": document,
        }
        for document in documents
    )
    success, errors = bulk(client, actions, raise_on_error=False, refresh=True)
    return success, errors


def create_es_client() -> Elasticsearch:
    return Elasticsearch(
        settings.host,
        basic_auth=(settings.username, settings.password),
        verify_certs=False,
    )
