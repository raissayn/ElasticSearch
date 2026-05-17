from app.domain.es_client import EsClient
from app.models.result import Result, SearchResponse


class SearchService:
    def __init__(self):
        self.es_client = EsClient()

    def submit_query(self, query: str, page: int = 1, sort_by: str = "relevance"):
        search_response = self.es_client.search(query, page, sort_by)

        hits_obj = search_response["hits"]
        max_score = hits_obj.get("max_score") or 0.0
        total = hits_obj.get("total", {}).get("value", 0)
        hits = hits_obj["hits"]

        results_list = []

        for hit in hits:
            source = hit["_source"]
            score = hit.get("_score") or 0.0

            result = Result(
                title=source.get("title", ""),
                url=source.get("url", ""),
                chunk_type=source.get("chunk_type", "page_text"),
                discipline_name=source.get("discipline_name", ""),
                period=source.get("period", ""),
                course_name=source.get("course_name", ""),
                summary=source.get("summary", ""),
                workload_total=source.get("workload_total"),
                workload_theoretical=source.get("workload_theoretical"),
                workload_practical=source.get("workload_practical"),
                workload_activity=source.get("workload_activity"),
                prerequisites=source.get("prerequisites", []),
                tags=source.get("tags", []),
                page_start=source.get("page_start", 1),
                ingested_at=source.get("ingested_at", ""),
                source_file=source.get("source_file", ""),
                score=score,
                max_score=max_score,
            )

            results_list.append(result)

        return SearchResponse(
            results=results_list,
            total=total,
            max_score=max_score,
            page=page,
            sort_by=sort_by,
        )