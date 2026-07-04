from typing import Optional

from pydantic import BaseModel


class Result(BaseModel):
    # Common metadata
    document_id: str = ""
    source_id: str = ""
    tipo_documento: str = ""
    tipo_conteudo: str = ""
    titulo_documento: str = ""
    curso: str = ""
    unidade: str = ""
    pagina: int = 1
    url_documento: str = ""
    tags: list[str] = []
    score: float = 0.0
    max_score: float = 0.0

    # Disciplina fields
    nome_disciplina: str = ""
    periodo: Optional[int] = None
    tipo_disciplina: str = ""
    pre_requisitos: list[str] = []
    ementa: str = ""
    carga_horaria_total: Optional[int] = None
    carga_horaria_teorica: Optional[int] = None
    carga_horaria_pratica: Optional[int] = None

    # Seção texto fields
    titulo_secao: str = ""
    conteudo: str = ""

    # Pessoa fields
    nome_pessoa: str = ""
    cargo: str = ""
    titulacao: str = ""
    area_atuacao: str = ""

    # Highlight field
    highlight: Optional[str] = None


class SearchResponse(BaseModel):
    results: list[Result]
    total: int = 0
    max_score: float = 0.0
    page: int = 1
    sort_by: str = "relevance"
    suggested_query: Optional[str] = None
