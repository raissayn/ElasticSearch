from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.domain.es_client import EsClient
from app.schemas.result import Result
from app.services.search_service import SearchService

router = APIRouter()


def get_search_service() -> SearchService:
    return SearchService(EsClient())


@router.get("/search", response_model=list[Result])
def search(
    query: str = Query(...),
    page: int = Query(1, ge=1),
    search_service: Annotated[SearchService, Depends(get_search_service)] = None,
):
    return search_service.submit_query(query, page)
