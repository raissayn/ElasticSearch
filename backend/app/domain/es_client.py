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

    def search(self, query: str, page: int = 1, sort_by: str = "relevance"):
        page_size = settings.page_size
        from_value = ((page if page else 1) - 1) * page_size

        search_kwargs = {
            "index": settings.index_name,
            "from_": from_value,
            "size": page_size,
            "query": {
                "multi_match": {
                    "query": query,
                    "fields": list(settings.boosted_search_fields),
                }
            },
        }

        if sort_by == "recent":
            search_kwargs["sort"] = [
                {"ingested_at": {"order": "desc"}},
                "_score",
            ]
            # Ensure _score is still calculated when using custom sort
            search_kwargs["track_scores"] = True

        response = self.client.search(**search_kwargs)

        return response