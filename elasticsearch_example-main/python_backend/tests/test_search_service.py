from app.services.search_service import SearchService


class StubEsClient:
    def search(self, query: str, page: int):
        return [
            {
                "title": "Elastic",
                "url": "http://elastic.test",
                "_snippet": "  Conteudo <som1>extra</som1> !!!  ",
            }
        ]


def test_treat_content_removes_markup_symbols_and_extra_spaces():
    service = SearchService(es_client=None)

    treated = service.treat_content("  Texto <som2>ruido</som2> com <math3>x+y</math3> !!!  ")

    assert treated == "Texto ruido com x+y !!!"


def test_submit_query_transforms_documents_into_results():
    service = SearchService(es_client=StubEsClient())

    results = service.submit_query("elastic", 1)

    assert len(results) == 1
    assert results[0].title == "Elastic"
    assert results[0].url == "http://elastic.test"
    assert results[0].abs == "Conteudo extra !!!"
