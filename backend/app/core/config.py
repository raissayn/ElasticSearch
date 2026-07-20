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

import os
from dataclasses import dataclass
from typing import Tuple


@dataclass(frozen=True)
class Settings:
    host: str = os.environ.get("ELASTIC_HOST", "http://localhost:9200")
    username: str = "elastic"
    password: str = "user123"
    index_name: str = "unisearch_documentos"
    boosted_search_fields: Tuple[str, ...] = (
        "conteudo",
        "ementa",
        "nome_disciplina^3",
        "titulo_documento^2",
        "titulo_secao^2",
        "nome_pessoa^2",
        "area_atuacao",
        "curso",
    )
    page_size: int = 10
    api_prefix: str = "/v1"


settings = Settings()
