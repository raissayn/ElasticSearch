import os
from dataclasses import dataclass
from typing import Tuple


@dataclass(frozen=True)
class Settings:
    host: str = os.environ.get("ELASTIC_HOST", "http://localhost:9200")
    username: str = "elastic"
    password: str = "user123"
    index_name: str = "unisearch_documentos"
    boosted_search_fields: Tuple[str, ...] = (
        "conteudo",
        "ementa",
        "nome_disciplina^3",
        "titulo_documento^2",
        "titulo_secao^2",
        "nome_pessoa^2",
        "area_atuacao",
        "curso",
    )
    page_size: int = 10
    api_prefix: str = "/v1"


settings = Settings()
