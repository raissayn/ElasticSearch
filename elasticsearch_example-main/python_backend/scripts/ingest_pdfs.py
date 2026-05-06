from __future__ import annotations

import argparse
import glob
import os
from pathlib import Path
import sys

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.core.config import settings
from app.ingestion.pdf_ingestion import (
    build_documents_for_source,
    create_es_client,
    extract_pages,
    index_documents,
    load_manifest,
)


def resolve_local_path(raw_path: str) -> Path:
    if any(char in raw_path for char in "*?[]"):
        matches = glob.glob(raw_path)
        if not matches:
            return Path(raw_path)
        newest = max(matches, key=os.path.getmtime)
        return Path(newest)
    return Path(raw_path)


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract PDF pages and index chunks in Elasticsearch.")
    parser.add_argument(
        "--manifest",
        default="data/documents_manifest.example.json",
        help="Path to documents manifest.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Only extract and print chunk counters without indexing.",
    )
    args = parser.parse_args()

    manifest_path = Path(args.manifest)
    sources = load_manifest(manifest_path)
    all_documents = []

    for source in sources:
        local_path = resolve_local_path(source["local_path"])
        if not local_path.exists():
            raise FileNotFoundError(f"PDF not found: {local_path}")

        normalized_source = dict(source)
        normalized_source["local_path"] = str(local_path)
        pages = extract_pages(local_path)
        documents = build_documents_for_source(normalized_source, pages)
        all_documents.extend(documents)
        print(
            f"Source {normalized_source['source_id']}: pages={len(pages)} "
            f"chunks={len(documents)} path={local_path}"
        )

    print(f"Total chunks prepared: {len(all_documents)}")

    if args.dry_run:
        print("Dry run enabled. No data sent to Elasticsearch.")
        return 0

    client = create_es_client()
    success, errors = index_documents(client, settings.index_name, all_documents)
    print(f"Indexed documents: {success}")
    if errors:
        print(f"Errors: {len(errors)}")
        for error in errors[:5]:
            print(error)
        return 1

    print("Ingestion finished successfully.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
