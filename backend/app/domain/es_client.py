import re
import unicodedata

from elasticsearch import Elasticsearch

from app.core.config import settings

FUZZY_SEARCH_FIELDS = [
    "conteudo",
    "ementa",
    "nome_disciplina^3",
    "titulo_documento^2",
    "titulo_secao^2",
    "nome_pessoa^2",
    "area_atuacao",
]

PREFIX_SEARCH_FIELDS = {
    "nome_disciplina": 3,
    "titulo_documento": 2,
    "titulo_secao": 2,
    "nome_pessoa": 2,
}

SUGGESTION_FIELDS = (
    "nome_disciplina.suggest",
    "titulo_documento.suggest",
    "titulo_secao.suggest",
    "nome_pessoa.suggest",
    "ementa.suggest",
)

MIN_SUGGESTION_SCORE = 0.01
MIN_TERM_SUGGESTION_SCORE = 0.75
HIGH_CONFIDENCE_SUGGESTION_FIELDS = {
    "nome_disciplina.suggest",
    "titulo_documento.suggest",
    "titulo_secao.suggest",
    "nome_pessoa.suggest",
}


def build_search_query(query: str, tipo_conteudo: str = "") -> dict:
    # Layer exact, fuzzy, and prefix clauses so exact matches keep priority while
    # typos and incomplete important names still have a controlled path to match.
    search_query = {
        "bool": {
            "should": [
                {
                    "multi_match": {
                        "_name": "exact_boosted_fields",
                        "query": query,
                        "fields": list(settings.boosted_search_fields),
                        "boost": 2.0,
                    }
                },
                {
                    "multi_match": {
                        "_name": "controlled_fuzzy_fields",
                        "query": query,
                        "fields": FUZZY_SEARCH_FIELDS,
                        "type": "best_fields",
                        "operator": "or",
                        "minimum_should_match": "75%",
                        "fuzziness": "AUTO:4,7",
                        "prefix_length": 1,
                        "max_expansions": 30,
                        "fuzzy_transpositions": True,
                        "boost": 0.9,
                    }
                },
                {
                    "dis_max": {
                        "_name": "important_prefix_fields",
                        "tie_breaker": 0.2,
                        "queries": [
                            {
                                "match_phrase_prefix": {
                                    field: {
                                        "query": query,
                                        "max_expansions": 20,
                                        "boost": boost,
                                    }
                                }
                            }
                            for field, boost in PREFIX_SEARCH_FIELDS.items()
                        ],
                    }
                },
            ],
            "minimum_should_match": 1,
        }
    }

    if not tipo_conteudo:
        return search_query

    return {
        "bool": {
            "must": search_query,
            "filter": {"term": {"tipo_conteudo": tipo_conteudo}},
        }
    }


def build_search_suggest(query: str) -> dict:
    suggest = {}

    for field in SUGGESTION_FIELDS:
        key = field.replace('.', '_')
        suggest[f"did_you_mean_{key}"] = {
            "text": query,
            "phrase": {
                "field": field,
                "size": 1,
                "gram_size": 2,
                "confidence": 0.7,
                "direct_generator": [
                    {
                        "field": field,
                        "suggest_mode": "missing",
                        "min_word_length": 3,
                    }
                ],
            },
        }
        suggest[f"did_you_mean_term_{key}"] = {
            "text": query,
            "term": {
                "field": field,
                "suggest_mode": "missing",
                "min_word_length": 3,
                "size": 2,
            },
        }

    return suggest


def should_return_suggestion(total: int) -> bool:
    return True


def normalize_suggestion_text(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value.strip().casefold())
    return "".join(char for char in normalized if not unicodedata.combining(char))


def suggestion_field_from_name(name: str) -> str:
    prefix = "did_you_mean_term_"
    if not name.startswith(prefix):
        return ""
    return name.removeprefix(prefix).replace("_suggest", ".suggest")


def extract_term_suggested_query(response: dict, original_query: str) -> str | None:
    corrections = {}

    for name, entries in response.get("suggest", {}).items():
        field = suggestion_field_from_name(name)
        if not field:
            continue

        high_confidence_field = field in HIGH_CONFIDENCE_SUGGESTION_FIELDS
        for entry in entries:
            original_token = str(entry.get("text", "")).strip()
            if not original_token:
                continue

            normalized_original = normalize_suggestion_text(original_token)
            best_option = None
            for option in entry.get("options", []):
                candidate = str(option.get("text", "")).strip()
                score = float(option.get("score") or 0.0)
                if (
                    not candidate
                    or score < MIN_TERM_SUGGESTION_SCORE
                    or normalize_suggestion_text(candidate) == normalized_original
                ):
                    continue

                rank = (score, high_confidence_field, int(option.get("freq") or 0))
                if best_option is None or rank > best_option[0]:
                    best_option = (rank, candidate, high_confidence_field)

            if best_option is None:
                continue

            current = corrections.get(normalized_original)
            if current is None or best_option[0] > current[0]:
                corrections[normalized_original] = best_option

    if not corrections:
        return None

    has_high_confidence_correction = any(correction[2] for correction in corrections.values())
    
    # Selection rule:
    # 1. If we have at least one high confidence correction, we keep all corrections (to avoid mixed queries)
    # 2. If we only have low confidence corrections, we require at least 2 corrections to filter out single noisy spelling candidates.
    if has_high_confidence_correction:
        selected = corrections
    else:
        if len(corrections) >= 2:
            selected = corrections
        else:
            selected = {}

    if not selected:
        return None

    suggested_tokens = []
    changed = False
    # Use re.split to tokenize original query, preserving spaces and punctuation
    for token in re.split(r'(\W+)', original_query):
        if not token:
            continue
        # Only correct alphanumeric words
        if re.match(r'^\w+$', token):
            correction = selected.get(normalize_suggestion_text(token))
            if correction is not None:
                suggested_tokens.append(correction[1])
                changed = True
                continue
        suggested_tokens.append(token)

    if not changed:
        return None

    candidate = "".join(suggested_tokens).strip()
    if normalize_suggestion_text(candidate) == normalize_suggestion_text(original_query):
        return None
    return candidate


def extract_phrase_suggested_query(response: dict, original_query: str, total: int) -> str | None:
    if total != 0:
        return None

    normalized_original = normalize_suggestion_text(original_query)
    best_text = None
    best_score = -1.0

    for name, entries in response.get("suggest", {}).items():
        if name.startswith("did_you_mean_term_"):
            continue
        for entry in entries:
            for option in entry.get("options", []):
                candidate = str(option.get("text", "")).strip()
                if not candidate or normalize_suggestion_text(candidate) == normalized_original:
                    continue

                score = float(option.get("score") or 0.0)
                if score > best_score:
                    best_text = candidate
                    best_score = score

    if best_score < MIN_SUGGESTION_SCORE:
        return None

    return best_text


def restore_accents_from_response(suggested_query: str, response: dict) -> str:
    word_map = {}
    
    # Scan all search results source text to map normalized words to their accented versions
    for hit in response.get("hits", {}).get("hits", []):
        src = hit.get("_source", {})
        for field in ["nome_disciplina", "titulo_documento", "titulo_secao", "nome_pessoa", "ementa", "conteudo"]:
            val = src.get(field)
            if val and isinstance(val, str):
                for word in re.findall(r'\w+', val):
                    normalized = normalize_suggestion_text(word)
                    if normalized and normalized not in word_map:
                        word_map[normalized] = word
                        
        # Scan highlight fields (which contain matching text segments)
        highlight = hit.get("highlight", {})
        for val_list in highlight.values():
            for val in val_list:
                clean_text = re.sub(r'<[^>]+>', ' ', val)
                for word in re.findall(r'\w+', clean_text):
                    normalized = normalize_suggestion_text(word)
                    if normalized and normalized not in word_map:
                        word_map[normalized] = word

    # Reconstruct the suggested query, replacing terms with their original accented forms
    suggested_tokens = []
    for token in re.split(r'(\W+)', suggested_query):
        if not token:
            continue
        if re.match(r'^\w+$', token):
            normalized = normalize_suggestion_text(token)
            restored = word_map.get(normalized)
            if restored:
                if token.islower():
                    restored = restored.lower()
                suggested_tokens.append(restored)
                continue
        suggested_tokens.append(token)
        
    return "".join(suggested_tokens)


def extract_suggested_query(response: dict, original_query: str, total: int, max_score: float) -> str | None:
    if not should_return_suggestion(total):
        return None

    term_suggestion = extract_term_suggested_query(response, original_query)
    if term_suggestion:
        return restore_accents_from_response(term_suggestion, response)

    phrase_suggestion = extract_phrase_suggested_query(response, original_query, total)
    if phrase_suggestion:
        return restore_accents_from_response(phrase_suggestion, response)

    return None


class EsClient:
    def __init__(self):
        client_kwargs = {
            "hosts": [settings.host],
            "verify_certs": False
        }
        if settings.host.startswith("https") and settings.username:
            client_kwargs["basic_auth"] = (settings.username, settings.password)
            
        self.client = Elasticsearch(**client_kwargs)

    def search(
        self,
        query: str,
        page: int = 1,
        sort_by: str = "relevance",
        tipo_conteudo: str = "",
        include_suggestions: bool = False,
    ):
        page_size = settings.page_size
        from_value = ((page if page else 1) - 1) * page_size

        query_body = build_search_query(query, tipo_conteudo)

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

        if include_suggestions:
            search_kwargs["suggest"] = build_search_suggest(query)

        if sort_by == "recent":
            search_kwargs["sort"] = [
                {"indexado_em": {"order": "desc"}},
                "_score",
            ]
            search_kwargs["track_scores"] = True

        response = self.client.search(**search_kwargs)

        return response