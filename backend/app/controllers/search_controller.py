from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from app.models.result import SearchResponse
from app.services.search_service import SearchService

router = APIRouter()

search_service = SearchService()


@router.get("/search", response_model=SearchResponse)
async def search(
    query: str = Query(..., description="Query to be submitted"),
    page: int = Query(1, description="Page number of results"),
    sort_by: str = Query("relevance", description="Sort order: 'relevance' or 'recent'"),
    tipo: str = Query("", description="Filter by content type: 'disciplina', 'secao_texto', 'pessoa'"),
    include_suggestions: bool = Query(False, description="Include an optional did-you-mean suggested query"),
):
    result = search_service.submit_query(query, page, sort_by, tipo, include_suggestions)

    if include_suggestions:
        return JSONResponse(content=result)

    return result
