from typing import Optional

from pydantic import BaseModel


class Result(BaseModel):
    # Identification
    title: str
    url: str
    chunk_type: str = "page_text"

    # Discipline structured data
    discipline_name: str = ""
    period: str = ""
    course_name: str = ""
    summary: str = ""

    # Workload
    workload_total: Optional[int] = None
    workload_theoretical: Optional[int] = None
    workload_practical: Optional[int] = None
    workload_activity: Optional[int] = None

    # Prerequisites
    prerequisites: list[str] = []

    # Metadata
    tags: list[str] = []
    page_start: int = 1
    ingested_at: str = ""
    source_file: str = ""

    # Search relevance
    score: float = 0.0
    max_score: float = 0.0


class SearchResponse(BaseModel):
    results: list[Result]
    total: int = 0
    max_score: float = 0.0
    page: int = 1
    sort_by: str = "relevance"