from elasticsearch import Elasticsearch


class EsClient:
    def __init__(self):
        self.client = Elasticsearch(
            "https://localhost:9200",
            basic_auth=("elastic", "user123"),
            verify_certs=False
        )

    def search(self, query: str, page: int = 1):
        page_size = 10
        from_value = ((page if page else 1) - 1) * page_size

        response = self.client.search(
            index="wikipedia",
            from_=from_value,
            size=page_size,
            query={
                "match": {
                    "content": query
                }
            }
        )

        return response