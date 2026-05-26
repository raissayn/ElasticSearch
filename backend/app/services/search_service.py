from app.domain.es_client import EsClient
from app.models.result import Result, SearchResponse


class SearchService:
    def __init__(self):
        self.es_client = EsClient()

    def submit_query(self, query: str, page: int = 1, sort_by: str = "relevance", tipo_conteudo: str = ""):
        response = self.es_client.search(query, page, sort_by, tipo_conteudo)

        hits_obj = response["hits"]
        max_score = hits_obj.get("max_score") or 0.0
        total = hits_obj.get("total", {}).get("value", 0)

        results = []
        for hit in hits_obj["hits"]:
            src = hit["_source"]
            src["score"] = hit.get("_score") or 0.0
            src["max_score"] = max_score
            results.append(Result(**{k: v for k, v in src.items() if v is not None}))

        return SearchResponse(
            results=results,
            total=total,
            max_score=max_score,
            page=page,
            sort_by=sort_by,
        )