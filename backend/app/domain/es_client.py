from elasticsearch import Elasticsearch

from app.core.config import settings


class EsClient:
    def __init__(self):
        client_kwargs = {
            "hosts": [settings.host],
            "verify_certs": False
        }
        if settings.host.startswith("https") and settings.username:
            client_kwargs["basic_auth"] = (settings.username, settings.password)
            
        self.client = Elasticsearch(**client_kwargs)

    def search(self, query: str, page: int = 1):
        page_size = settings.page_size
        from_value = ((page if page else 1) - 1) * page_size

        response = self.client.search(
            index=settings.index_name,
            from_=from_value,
            size=page_size,
            query={
                "multi_match": {
                    "query": query,
                    "fields": settings.boosted_search_fields
                }
            }
        )

        return response