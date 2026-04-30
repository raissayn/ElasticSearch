from fastapi.testclient import TestClient

from app.controllers.search_controller import get_search_service
from app.main import app


class StubSearchService:
    def submit_query(self, query: str, page: int):
        return [{"title": "Elastic", "url": "http://elastic.test", "abs": "Resumo"}]


def test_get_search_returns_transformed_results():
    app.dependency_overrides[get_search_service] = lambda: StubSearchService()
    client = TestClient(app)

    response = client.get("/v1/search", params={"query": "elastic", "page": 1})

    assert response.status_code == 200
    assert response.json() == [{"title": "Elastic", "url": "http://elastic.test", "abs": "Resumo"}]
    app.dependency_overrides.clear()
