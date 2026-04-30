from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    host: str = "https://localhost:9200"
    username: str = "elastic"
    password: str = "user123"
    index_name: str = "wikipedia"
    search_field: str = "content"
    page_size: int = 10
    api_prefix: str = "/v1"


settings = Settings()
