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

from fastapi import APIRouter, Query
from app.models.result import SearchResponse
from app.services.search_service import SearchService

router = APIRouter()

search_service = SearchService()


@router.get("/search", response_model=SearchResponse, response_model_exclude_none=True)
async def search(
    query: str = Query(..., description="Query to be submitted"),
    page: int = Query(1, description="Page number of results"),
    sort_by: str = Query("relevance", description="Sort order: 'relevance' or 'recent'"),
    tipo: str = Query("", description="Filter by content type: 'disciplina', 'secao_texto', 'pessoa'"),
    include_suggestions: bool = Query(False, description="Include an optional did-you-mean suggested query"),
):
    return search_service.submit_query(query, page, sort_by, tipo, include_suggestions)
