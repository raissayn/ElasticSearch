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

PERIOD_NAMES = {
    "primeiro": 1, "segundo": 2, "terceiro": 3, "quarto": 4,
    "quinto": 5, "sexto": 6, "sétimo": 7, "setimo": 7, "oitavo": 8,
}

# Non-whitespace sentinel so it survives normalize_text() and lets us track which
# page a discipline starts/spans after merging all pages of a source.
PAGE_SEPARATOR = "\x1E"

# Recurring footer line in PPC pages. Stripped only from disciplina bodies so the
# SEI number stays searchable in regulamento (secao_texto) documents.
BOILERPLATE_PATTERN = re.compile(
    r"\s*Projeto Pedag[óo]gico[^/]*?SEI\s*[\d./-]+\s*/\s*pg\.?\s*\d+\s*",
    flags=re.IGNORECASE,
)


def load_manifest(manifest_path: Path) -> list[dict[str, Any]]:
    with manifest_path.open("r", encoding="utf-8") as file:
        payload = json.load(file)

    documents: list[dict[str, Any]] = []
    for section in ("documents", "dynamics", "faculty"):
        documents.extend(payload.get(section, []) or [])

    if not isinstance(documents, list) or not documents:
        raise ValueError("Manifest must contain at least one non-empty section among 'documents', 'dynamics', 'faculty'.")

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
    # Remove multiple dots (common in TOCs)
    content = re.sub(r"\.{2,}", " ", content)
    # Remove multiple spaces
    content = re.sub(r"\s+", " ", content)
    return content.strip()


def build_page_url(base_url: str, page_number: int) -> str:
    return f"{base_url}#page={page_number}"


def parse_period_number(period_text: str) -> int | None:
    if not period_text:
        return None
    return PERIOD_NAMES.get(period_text.lower().strip())


def strip_boilerplate(text: str) -> str:
    return BOILERPLATE_PATTERN.sub(" ", text)


def merge_pages(pages: list[tuple[int, str]]) -> tuple[str, list[int]]:
    merged = PAGE_SEPARATOR.join(text for _, text in pages)
    return merged, [page_number for page_number, _ in pages]


def page_at_offset(merged: str, page_numbers: list[int], offset: int) -> int:
    if not page_numbers:
        return 0
    index = merged.count(PAGE_SEPARATOR, 0, offset)
    return page_numbers[min(index, len(page_numbers) - 1)]


def trim_last_discipline_body(body: str) -> str:
    # Bound the last discipline to the page that contains its Ementa so trailing
    # regulamento sections are not absorbed into the disciplina document.
    ementa_pos = body.lower().find("ementa:")
    if ementa_pos == -1:
        return body
    sep_after = body.find(PAGE_SEPARATOR, ementa_pos)
    if sep_after == -1:
        return body
    return body[:sep_after]


def build_documents_for_source(source: dict[str, Any], pages: list[tuple[int, str]]) -> list[dict[str, Any]]:
    source_id = str(source["source_id"])
    public_url = str(source["public_url"])
    now_iso = datetime.now(timezone.utc).isoformat()

    common = {
        "source_id": source_id,
        "tipo_documento": source.get("tipo_documento", "ppc"),
        "titulo_documento": source["title"],
        "curso": source.get("curso", ""),
        "instituicao": source.get("instituicao", "UNIFAL-MG"),
        "ano_vigencia": source.get("ano_vigencia"),
        "tags": list(set(source.get("tags") or [])),
        "indexado_em": now_iso,
    }
    page_text_by_number = {number: text for number, text in pages}

    documents: list[dict[str, Any]] = []

    # Pass A: disciplines are parsed over the merged page stream so a table that
    # is split across a page break is captured whole, with its ementa complete.
    merged, page_numbers = merge_pages(pages)
    chunks = list(DISCIPLINE_PATTERN.finditer(merged))
    discipline_pages: set[int] = set()

    for chunk_index, chunk in enumerate(chunks):
        body = chunk.group("body")
        body_end_offset = chunk.end()
        if chunk_index == len(chunks) - 1:
            trimmed = trim_last_discipline_body(body)
            body_end_offset = chunk.start("body") + len(trimmed)
            body = trimmed

        start_page = page_at_offset(merged, page_numbers, chunk.start())
        end_page = page_at_offset(merged, page_numbers, body_end_offset)
        discipline_pages.update(
            number for number in page_numbers if start_page <= number <= end_page
        )

        body = normalize_text(strip_boilerplate(body).replace(PAGE_SEPARATOR, " "))
        period_match = PERIOD_PATTERN.search(page_text_by_number.get(start_page, ""))
        period = period_match.group(1).title() if period_match else source.get("period", "")
        workloads = extract_workload(body)

        documents.append(
            {
                **common,
                "document_id": f"{source_id}-d{chunk_index + 1}",
                "tipo_conteudo": "disciplina",
                "nome_disciplina": normalize_text(
                    chunk.group("discipline").replace(PAGE_SEPARATOR, " ")
                ),
                "periodo": parse_period_number(period),
                "tipo_disciplina": "Obrigatória",
                "pre_requisitos": extract_prerequisites(body),
                "ementa": extract_summary(body),
                "conteudo": body,
                "carga_horaria_total": workloads["total"],
                "carga_horaria_teorica": workloads["theoretical"],
                "carga_horaria_pratica": workloads["practical"],
                "pagina": start_page,
                "url_documento": build_page_url(public_url, start_page),
            }
        )

    # Pass B: regulamento pages keep per-page secao_texto with the SEI/footer
    # intact so the SEI number stays searchable. Pages absorbed by a discipline
    # (including cut-table continuations) are skipped to avoid leaking footers.
    for page_number, page_text in pages:
        if page_number in discipline_pages:
            continue
        documents.append(
            {
                **common,
                "document_id": f"{source_id}-p{page_number}",
                "tipo_conteudo": "secao_texto",
                "titulo_secao": "",
                "conteudo": page_text,
                "pagina": page_number,
                "url_documento": build_page_url(public_url, page_number),
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
