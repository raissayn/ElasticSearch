from app.domain.es_client import EsClient
from app.models.result import Result
from app.utils.content_utils import treat_content


class SearchService:
    def __init__(self):
        self.es_client = EsClient()

    def submit_query(self, query: str, page: int = 1):
        search_response = self.es_client.search(query, page)

        hits = search_response["hits"]["hits"]

        results_list = []

        for hit in hits:
            source = hit["_source"]

            result = Result(
                title=source.get("title", ""),
                url=source.get("url", ""),
                abs=treat_content(source.get("content", ""))
            )

            results_list.append(result)

        return results_list