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

from typing import Optional

from pydantic import BaseModel


class Result(BaseModel):
    # Common metadata
    document_id: str = ""
    source_id: str = ""
    tipo_documento: str = ""
    tipo_conteudo: str = ""
    titulo_documento: str = ""
    curso: str = ""
    unidade: str = ""
    pagina: int = 1
    url_documento: str = ""
    tags: list[str] = []
    score: float = 0.0
    max_score: float = 0.0

    # Disciplina fields
    nome_disciplina: str = ""
    periodo: Optional[int] = None
    tipo_disciplina: str = ""
    pre_requisitos: list[str] = []
    ementa: str = ""
    carga_horaria_total: Optional[int] = None
    carga_horaria_teorica: Optional[int] = None
    carga_horaria_pratica: Optional[int] = None

    # Seção texto fields
    titulo_secao: str = ""
    conteudo: str = ""

    # Pessoa fields
    nome_pessoa: str = ""
    cargo: str = ""
    titulacao: str = ""
    area_atuacao: str = ""

    # Highlight field
    highlight: Optional[str] = None


class SearchResponse(BaseModel):
    results: list[Result]
    total: int = 0
    max_score: float = 0.0
    page: int = 1
    sort_by: str = "relevance"
    suggested_query: Optional[str] = None
