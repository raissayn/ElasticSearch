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
            query={
                "multi_match": {
                    "query": query,
                    "fields": list(settings.boosted_search_fields),
                    "type": "best_fields",
                }
            },
            highlight={
                "fields": {
                    "content": {"number_of_fragments": 1},
                    "summary": {"number_of_fragments": 1},
                }
            },
        )
        hits = response.get("hits", {}).get("hits", [])
        documents: list[dict] = []
        for hit in hits:
            source = hit.get("_source", {})
            highlight = hit.get("highlight", {})
            snippet = ""
            if highlight.get("content"):
                snippet = " ".join(highlight["content"])
            elif highlight.get("summary"):
                snippet = " ".join(highlight["summary"])

            document = dict(source)
            if snippet:
                document["_snippet"] = snippet
            documents.append(document)

        return documents
