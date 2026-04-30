from elasticsearch import Elasticsearch

from app.core.config import settings


class EsClient:
    def __init__(self, client: Elasticsearch | None = None):
        self.client = client or Elasticsearch(
            settings.host,
            basic_auth=(settings.username, settings.password),
            verify_certs=False,
        )

    def search(self, query: str, page: int | None = 1) -> list[dict]:
        current_page = page or 1
        from_ = (current_page - 1) * settings.page_size
        response = self.client.search(
            index=settings.index_name,
            from_=from_,
            size=settings.page_size,
            query={"match": {settings.search_field: query}},
        )
        hits = response.get("hits", {}).get("hits", [])
        return [hit.get("_source", {}) for hit in hits]
