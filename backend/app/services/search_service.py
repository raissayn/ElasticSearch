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

        # Use cardinality aggregation for the total if it exists
        if "aggregations" in response and "total_collapsed" in response["aggregations"]:
            total = response["aggregations"]["total_collapsed"].get("value", total)

        results = []
        for hit in hits_obj["hits"]:
            src = hit["_source"]
            src["score"] = hit.get("_score") or 0.0
            src["max_score"] = max_score
            
            # Extract highlight
            highlight_dict = hit.get("highlight", {})
            # Prioritize ementa/conteudo for the main snippet, but also check others
            possible_highlights = (
                highlight_dict.get("ementa") or 
                highlight_dict.get("conteudo") or 
                highlight_dict.get("titulo_secao") or
                highlight_dict.get("nome_disciplina") or
                highlight_dict.get("titulo_documento")
            )
            if possible_highlights:
                src["highlight"] = possible_highlights[0]
                
            results.append(Result(**{k: v for k, v in src.items() if v is not None}))

        return SearchResponse(
            results=results,
            total=total,
            max_score=max_score,
            page=page,
            sort_by=sort_by,
        )