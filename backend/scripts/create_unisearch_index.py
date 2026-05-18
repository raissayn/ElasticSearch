from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

from elasticsearch import Elasticsearch

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.core.config import settings


def create_client() -> Elasticsearch:
    client_kwargs = {
        "hosts": [settings.host],
        "verify_certs": False
    }
    if settings.host.startswith("https") and settings.username:
        client_kwargs["basic_auth"] = (settings.username, settings.password)
    return Elasticsearch(**client_kwargs)


def main() -> int:
    parser = argparse.ArgumentParser(description="Create unisearch_documentos index.")
    parser.add_argument(
        "--mapping",
        default="elastic/unisearch_documentos_mapping.json",
        help="Path to mapping JSON file.",
    )
    parser.add_argument(
        "--recreate",
        action="store_true",
        help="Delete index before creating it.",
    )
    args = parser.parse_args()

    mapping_path = Path(args.mapping)
    mapping = json.loads(mapping_path.read_text(encoding="utf-8"))
    client = create_client()

    if args.recreate and client.indices.exists(index=settings.index_name):
        client.indices.delete(index=settings.index_name)
        print(f"Deleted index: {settings.index_name}")

    if not client.indices.exists(index=settings.index_name):
        client.indices.create(index=settings.index_name, **mapping)
        print(f"Created index: {settings.index_name}")
    else:
        print(f"Index already exists: {settings.index_name}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
