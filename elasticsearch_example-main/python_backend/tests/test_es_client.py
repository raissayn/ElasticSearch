from app.domain.es_client import EsClient


class FakeElasticsearch:
    def __init__(self):
        self.last_kwargs = None

    def search(self, **kwargs):
        self.last_kwargs = kwargs
        return {"hits": {"hits": [{"_source": {"title": "A", "url": "u", "content": "c"}}]}}


def test_search_uses_expected_index_query_and_pagination():
    fake_client = FakeElasticsearch()
    es_client = EsClient(client=fake_client)

    documents = es_client.search("python", 3)

    assert fake_client.last_kwargs["index"] == "wikipedia"
    assert fake_client.last_kwargs["from_"] == 20
    assert fake_client.last_kwargs["size"] == 10
    assert fake_client.last_kwargs["query"] == {"match": {"content": "python"}}
    assert documents == [{"title": "A", "url": "u", "content": "c"}]
