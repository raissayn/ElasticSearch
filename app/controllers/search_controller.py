from typing import List

from fastapi import APIRouter, Query

from app.models.result import Result
from app.services.search_service import SearchService

router = APIRouter()

search_service = SearchService()


@router.get("/search", response_model=List[Result])
async def search(
    query: str = Query(..., description="Query to be submitted"),
    page: int = Query(1, description="Page number of results")
):
    result = search_service.submit_query(query, page)

    return result