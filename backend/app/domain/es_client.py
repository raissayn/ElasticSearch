from elasticsearch import Elasticsearch

from app.core.config import settings


class EsClient:
    def __init__(self):
        client_kwargs = {
            "hosts": [settings.host],
            "verify_certs": False
        }
        if settings.host.startswith("https") and settings.username:
            client_kwargs["basic_auth"] = (settings.username, settings.password)
            
        self.client = Elasticsearch(**client_kwargs)

    def search(self, query: str, page: int = 1, sort_by: str = "relevance", tipo_conteudo: str = ""):
        page_size = settings.page_size
        from_value = ((page if page else 1) - 1) * page_size

        # Fields where we want typo tolerance
        fuzzy_fields = [
            "conteudo",
            "ementa",
            "nome_disciplina^3",
            "titulo_documento^2",
            "titulo_secao^2",
            "nome_pessoa^2",
            "area_atuacao",
        ]

        must_query = {
            "bool": {
                "should": [
                    {
                        "multi_match": {
                            "query": query,
                            "fields": list(settings.boosted_search_fields),
                            "boost": 2.0,
                        }
                    },
                    {
                        "multi_match": {
                            "query": query,
                            "fields": fuzzy_fields,
                            "fuzziness": "AUTO",
                            "prefix_length": 2,
                            "boost": 1.0,
                        }
                    },
                ]
            }
        }

        if tipo_conteudo:
            query_body = {
                "bool": {
                    "must": must_query,
                    "filter": {"term": {"tipo_conteudo": tipo_conteudo}},
                }
            }
        else:
            query_body = must_query

        search_kwargs = {
            "index": settings.index_name,
            "from_": from_value,
            "size": page_size,
            "query": query_body,
            "collapse": {"field": "source_id"},
            "aggs": {
                "total_collapsed": {"cardinality": {"field": "source_id"}}
            },
            "highlight": {
                "type": "unified",
                "fields": {
                    "conteudo": {"fragment_size": 250, "number_of_fragments": 1},
                    "ementa": {"fragment_size": 250, "number_of_fragments": 1},
                    "nome_disciplina": {"number_of_fragments": 0},
                    "titulo_documento": {"number_of_fragments": 0},
                    "titulo_secao": {"number_of_fragments": 0}
                },
                "pre_tags": ["<mark>"],
                "post_tags": ["</mark>"],
                "require_field_match": False
            }
        }

        if sort_by == "recent":
            search_kwargs["sort"] = [
                {"indexado_em": {"order": "desc"}},
                "_score",
            ]
            search_kwargs["track_scores"] = True

        response = self.client.search(**search_kwargs)

        return response