# Python Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar uma nova pasta `python_backend/` com uma versao FastAPI do backend atual, preservando o endpoint `GET /v1/search`, a resposta `title/url/abs`, a paginacao e a limpeza do texto retornado pelo Elasticsearch.

**Architecture:** O backend Python sera dividido em camadas equivalentes ao projeto Java atual: rota HTTP, servico, cliente Elasticsearch e schemas. A implementacao mantera a API sob o prefixo `/v1`, com configuracao centralizada e uma documentacao HTML explicativa para estudo comparativo.

**Tech Stack:** Python 3, FastAPI, Uvicorn, Elasticsearch Python client, Pydantic, Pytest

---

### Task 1: Estrutura inicial e dependencias

**Files:**
- Create: `python_backend/requirements.txt`
- Create: `python_backend/README.md`
- Create: `python_backend/app/__init__.py`
- Create: `python_backend/app/controllers/__init__.py`
- Create: `python_backend/app/services/__init__.py`
- Create: `python_backend/app/domain/__init__.py`
- Create: `python_backend/app/schemas/__init__.py`
- Create: `python_backend/app/core/__init__.py`

- [ ] **Step 1: Criar a estrutura base**

```text
python_backend/
  app/
    __init__.py
    controllers/__init__.py
    services/__init__.py
    domain/__init__.py
    schemas/__init__.py
    core/__init__.py
  requirements.txt
  README.md
```

- [ ] **Step 2: Definir dependencias minimas**

```txt
fastapi==0.115.12
uvicorn==0.34.2
elasticsearch==8.17.2
pytest==8.3.5
httpx==0.28.1
```

- [ ] **Step 3: Documentar a forma de execucao**

```md
# Python Backend

## Como rodar

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080
```

### Task 2: Configuracao e schema de resposta

**Files:**
- Create: `python_backend/app/core/config.py`
- Create: `python_backend/app/schemas/result.py`
- Test: `python_backend/tests/test_result_schema.py`

- [ ] **Step 1: Escrever o teste que valida o schema**

```python
from app.schemas.result import Result


def test_result_schema_stores_expected_fields():
    result = Result(title="Titulo", url="http://example.com", abs="Resumo")

    assert result.title == "Titulo"
    assert result.url == "http://example.com"
    assert result.abs == "Resumo"
```

- [ ] **Step 2: Rodar o teste e verificar falha**

Run: `pytest python_backend/tests/test_result_schema.py -v`
Expected: FAIL com `ModuleNotFoundError` ou schema ausente

- [ ] **Step 3: Implementar configuracao e schema minimos**

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    host: str = "https://localhost:9200"
    username: str = "elastic"
    password: str = "user123"
    index_name: str = "wikipedia"
    search_field: str = "content"
    page_size: int = 10
    api_prefix: str = "/v1"


settings = Settings()
```

```python
from pydantic import BaseModel


class Result(BaseModel):
    title: str
    url: str
    abs: str
```

- [ ] **Step 4: Rodar o teste e verificar sucesso**

Run: `pytest python_backend/tests/test_result_schema.py -v`
Expected: PASS

### Task 3: Regra de limpeza de texto

**Files:**
- Create: `python_backend/app/services/search_service.py`
- Create: `python_backend/tests/test_search_service.py`

- [ ] **Step 1: Escrever o teste da limpeza de texto**

```python
from app.services.search_service import SearchService


def test_treat_content_removes_markup_symbols_and_extra_spaces():
    service = SearchService(es_client=None)

    treated = service.treat_content("  Texto <som2>ruido</som2> com <math3>x+y</math3> !!!  ")

    assert treated == "Texto ruido com xy"
```

- [ ] **Step 2: Rodar o teste e verificar falha**

Run: `pytest python_backend/tests/test_search_service.py::test_treat_content_removes_markup_symbols_and_extra_spaces -v`
Expected: FAIL porque `SearchService` ainda nao existe

- [ ] **Step 3: Implementar a classe de servico com a limpeza**

```python
import re


class SearchService:
    def __init__(self, es_client):
        self.es_client = es_client

    def treat_content(self, content: str) -> str:
        content = re.sub(r"</?(som|math)\d*>", "", content)
        content = re.sub(r"[^A-Za-z\s]+", "", content)
        content = re.sub(r"\s+", " ", content)
        content = re.sub(r"^\s+", "", content)
        return content
```

- [ ] **Step 4: Rodar o teste e verificar sucesso**

Run: `pytest python_backend/tests/test_search_service.py::test_treat_content_removes_markup_symbols_and_extra_spaces -v`
Expected: PASS

### Task 4: Transformacao de hits em resposta

**Files:**
- Modify: `python_backend/app/services/search_service.py`
- Modify: `python_backend/tests/test_search_service.py`

- [ ] **Step 1: Escrever o teste da transformacao**

```python
from app.services.search_service import SearchService


class StubEsClient:
    def search(self, query: str, page: int):
        return [
            {
                "title": "Elastic",
                "url": "http://elastic.test",
                "content": "  Conteudo <som1>extra</som1> !!!  "
            }
        ]


def test_submit_query_transforms_documents_into_results():
    service = SearchService(es_client=StubEsClient())

    results = service.submit_query("elastic", 1)

    assert len(results) == 1
    assert results[0].title == "Elastic"
    assert results[0].url == "http://elastic.test"
    assert results[0].abs == "Conteudo extra"
```

- [ ] **Step 2: Rodar o teste e verificar falha**

Run: `pytest python_backend/tests/test_search_service.py::test_submit_query_transforms_documents_into_results -v`
Expected: FAIL porque `submit_query` ainda nao existe

- [ ] **Step 3: Implementar a transformacao minima**

```python
from app.schemas.result import Result


def submit_query(self, query: str, page: int = 1) -> list[Result]:
    documents = self.es_client.search(query, page)
    return [
        Result(
            title=document.get("title", ""),
            url=document.get("url", ""),
            abs=self.treat_content(document.get("content", "")),
        )
        for document in documents
    ]
```

- [ ] **Step 4: Rodar os testes do servico**

Run: `pytest python_backend/tests/test_search_service.py -v`
Expected: PASS

### Task 5: Cliente Elasticsearch

**Files:**
- Create: `python_backend/app/domain/es_client.py`
- Create: `python_backend/tests/test_es_client.py`

- [ ] **Step 1: Escrever o teste da paginacao**

```python
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
```

- [ ] **Step 2: Rodar o teste e verificar falha**

Run: `pytest python_backend/tests/test_es_client.py -v`
Expected: FAIL porque `EsClient` ainda nao existe

- [ ] **Step 3: Implementar o cliente minimo**

```python
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
            query={"match": {settings.search_field: query}},
        )
        hits = response.get("hits", {}).get("hits", [])
        return [hit.get("_source", {}) for hit in hits]
```

- [ ] **Step 4: Rodar o teste e verificar sucesso**

Run: `pytest python_backend/tests/test_es_client.py -v`
Expected: PASS

### Task 6: Endpoint FastAPI

**Files:**
- Create: `python_backend/app/controllers/search_controller.py`
- Create: `python_backend/app/main.py`
- Create: `python_backend/tests/test_search_controller.py`

- [ ] **Step 1: Escrever o teste do endpoint**

```python
from fastapi.testclient import TestClient

from app.main import app


def test_get_search_returns_result_list():
    client = TestClient(app)

    response = client.get("/v1/search", params={"query": "elastic", "page": 1})

    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

- [ ] **Step 2: Rodar o teste e verificar falha**

Run: `pytest python_backend/tests/test_search_controller.py -v`
Expected: FAIL porque a aplicacao e a rota ainda nao existem

- [ ] **Step 3: Implementar a rota e a aplicacao**

```python
from fastapi import APIRouter, Query

from app.domain.es_client import EsClient
from app.schemas.result import Result
from app.services.search_service import SearchService

router = APIRouter()
service = SearchService(EsClient())


@router.get("/search", response_model=list[Result])
def search(query: str = Query(...), page: int = Query(1, ge=1)):
    return service.submit_query(query, page)
```

```python
from fastapi import FastAPI

from app.controllers.search_controller import router
from app.core.config import settings

app = FastAPI(title="Elasticsearch Search API - Python", version="1.0.0")
app.include_router(router, prefix=settings.api_prefix)
```

- [ ] **Step 4: Rodar o teste e verificar sucesso**

Run: `pytest python_backend/tests/test_search_controller.py -v`
Expected: PASS

### Task 7: Injetar dependencias para teste do endpoint

**Files:**
- Modify: `python_backend/app/controllers/search_controller.py`
- Modify: `python_backend/app/main.py`
- Modify: `python_backend/tests/test_search_controller.py`

- [ ] **Step 1: Escrever o teste com substituicao do servico**

```python
from fastapi.testclient import TestClient

from app.main import app, get_search_service


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
```

- [ ] **Step 2: Rodar o teste e verificar falha**

Run: `pytest python_backend/tests/test_search_controller.py::test_get_search_returns_transformed_results -v`
Expected: FAIL porque a dependencia ainda nao pode ser sobrescrita

- [ ] **Step 3: Refatorar a rota para dependencia explicita**

```python
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.domain.es_client import EsClient
from app.schemas.result import Result
from app.services.search_service import SearchService

router = APIRouter()


def get_search_service() -> SearchService:
    return SearchService(EsClient())


@router.get("/search", response_model=list[Result])
def search(
    query: str = Query(...),
    page: int = Query(1, ge=1),
    search_service: Annotated[SearchService, Depends(get_search_service)] = None,
):
    return search_service.submit_query(query, page)
```

- [ ] **Step 4: Rodar os testes do endpoint**

Run: `pytest python_backend/tests/test_search_controller.py -v`
Expected: PASS

### Task 8: Documentacao HTML

**Files:**
- Create: `python_backend/docs/backend_explicacao.html`

- [ ] **Step 1: Criar o HTML explicativo**

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>...</head>
  <body>
    <h1>Conversao do Backend Java para Python</h1>
    <section>Objetivo</section>
    <section>Estrutura de pastas</section>
    <section>Fluxo da requisicao</section>
    <section>Explicacao de cada arquivo</section>
    <section>Como executar</section>
  </body>
</html>
```

- [ ] **Step 2: Validar manualmente o conteudo**

Run: `sed -n '1,260p' python_backend/docs/backend_explicacao.html`
Expected: arquivo HTML com explicacao didatica completa

### Task 9: Verificacao final

**Files:**
- Test: `python_backend/tests/test_result_schema.py`
- Test: `python_backend/tests/test_search_service.py`
- Test: `python_backend/tests/test_es_client.py`
- Test: `python_backend/tests/test_search_controller.py`

- [ ] **Step 1: Rodar a suite de testes**

Run: `pytest python_backend/tests -v`
Expected: PASS em todos os testes

- [ ] **Step 2: Subir a aplicacao localmente**

Run: `uvicorn app.main:app --reload --port 8080`
Expected: servidor iniciado com rota `http://127.0.0.1:8080/v1/search`

- [ ] **Step 3: Testar uma chamada de exemplo**

Run: `curl "http://127.0.0.1:8080/v1/search?query=computador&page=1"`
Expected: lista JSON ou erro de conexao com Elasticsearch caso o servidor ES nao esteja disponivel
