from dataclasses import dataclass
from typing import Tuple


@dataclass(frozen=True)
class Settings:
    host: str = "http://localhost:9200"
    username: str = "elastic"
    password: str = "user123"
    index_name: str = "unisearch_documentos"
    search_field: str = "searchable_text"
    boosted_search_fields: Tuple[str, ...] = (
        "searchable_text",
        "title^2",
        "section_title^2",
        "discipline_name^3",
        "course_name",
    )
    page_size: int = 10
    api_prefix: str = "/v1"


settings = Settings()
