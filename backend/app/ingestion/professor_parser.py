# Copyright 2026 Raissa Nunes Peret, Vinicius Ribeiro da Silva do Carmo
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

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
