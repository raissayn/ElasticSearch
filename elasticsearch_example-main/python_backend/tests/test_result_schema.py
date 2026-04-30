from app.schemas.result import Result


def test_result_schema_stores_expected_fields():
    result = Result(title="Titulo", url="http://example.com", abs="Resumo")

    assert result.title == "Titulo"
    assert result.url == "http://example.com"
    assert result.abs == "Resumo"
