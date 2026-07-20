# Copyright 2026 Raissa Nunes Peret, Vinicius Ribeiro da Silva do Carmo
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

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
        default=None,
        help="Path to mapping JSON file. Defaults to <backend>/elastic/unisearch_documentos_mapping.json.",
    )
    parser.add_argument(
        "--recreate",
        action="store_true",
        help="Delete index before creating it.",
    )
    args = parser.parse_args()

    if args.mapping:
        mapping_path = Path(args.mapping)
    else:
        mapping_path = ROOT_DIR / "elastic" / "unisearch_documentos_mapping.json"
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
