from __future__ import annotations

import re

_SECTION_PATTERN = re.compile(
    r"^\s*(?P<nome>.*?)\s*"
    r"(?:Unidade:\s*(?P<unidade>.*?))?\s*"
    r"(?:Titulação:\s*(?P<titulacao>.*?))?\s*"
    r"(?:Resumo no Lattes:\s*(?P<resumo>.*))?\s*$",
    flags=re.DOTALL,
)


def parse_professor_text(text: str) -> dict[str, str]:
    text = text.strip()
    if not text:
        return {"nome_pessoa": "", "unidade": "", "titulacao": "", "conteudo": ""}

    match = _SECTION_PATTERN.match(text)
    if not match:
        return {"nome_pessoa": text, "unidade": "", "titulacao": "", "conteudo": ""}

    return {
        "nome_pessoa": (match.group("nome") or "").strip(),
        "unidade": (match.group("unidade") or "").strip(),
        "titulacao": (match.group("titulacao") or "").strip(),
        "conteudo": (match.group("resumo") or "").strip(),
    }
