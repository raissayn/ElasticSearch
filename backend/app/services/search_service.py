import unicodedata

from app.domain.es_client import EsClient, extract_suggested_query
from app.models.result import Result, SearchResponse


def normalize_key(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", str(value or "").strip().casefold())
    return "".join(char for char in normalized if not unicodedata.combining(char))


def result_dedupe_key(src: dict) -> tuple[str, ...]:
    tipo_conteudo = src.get("tipo_conteudo") or ""
    if tipo_conteudo == "disciplina" and src.get("nome_disciplina"):
        return (
            tipo_conteudo,
            normalize_key(src.get("curso", "")),
            normalize_key(src.get("nome_disciplina", "")),
        )

    if tipo_conteudo == "pessoa" and src.get("nome_pessoa"):
        return (
            tipo_conteudo,
            normalize_key(src.get("curso", "")),
            normalize_key(src.get("nome_pessoa", "")),
        )

    stable_id = (
        src.get("document_id")
        or src.get("source_id")
        or src.get("url_documento")
        or src.get("titulo_documento", "")
    )
    return (tipo_conteudo, normalize_key(stable_id))


class SearchService:
    def __init__(self):
        self.es_client = EsClient()

    def submit_query(
        self,
        query: str,
        page: int = 1,
        sort_by: str = "relevance",
        tipo_conteudo: str = "",
        include_suggestions: bool = False,
    ):
        response = self.es_client.search(
            query, page, sort_by, tipo_conteudo, include_suggestions
        )

        hits_obj = response["hits"]
        max_score = hits_obj.get("max_score") or 0.0
        total = hits_obj.get("total", {}).get("value", 0)

        # Use cardinality aggregation for the total if it exists
        if "aggregations" in response and "total_collapsed" in response["aggregations"]:
            total = response["aggregations"]["total_collapsed"].get("value", total)

        results = []
        seen_keys = set()
        for hit in hits_obj["hits"]:
            src = dict(hit["_source"])
            dedupe_key = result_dedupe_key(src)
            if dedupe_key in seen_keys:
                continue
            seen_keys.add(dedupe_key)

            src["score"] = hit.get("_score") or 0.0
            src["max_score"] = max_score

            # Only body highlights should replace the summary text. Title/name
            # highlights are already visible in the card title.
            highlight_dict = hit.get("highlight", {})
            possible_highlights = (
                highlight_dict.get("ementa") or
                highlight_dict.get("conteudo")
            )
            if possible_highlights:
                src["highlight"] = possible_highlights[0]

            results.append(Result(**{k: v for k, v in src.items() if v is not None}))

        if len(results) < len(hits_obj["hits"]):
            total = max(0, total - (len(hits_obj["hits"]) - len(results)))

        suggested_query = None
        if include_suggestions:
            suggested_query = extract_suggested_query(response, query, total, max_score)

        return SearchResponse(
            results=results,
            total=total,
            max_score=max_score,
            page=page,
            sort_by=sort_by,
            suggested_query=suggested_query,
        )
