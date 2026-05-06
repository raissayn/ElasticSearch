import re

from app.schemas.result import Result


class SearchService:
    def __init__(self, es_client):
        self.es_client = es_client

    def submit_query(self, query: str, page: int = 1) -> list[Result]:
        documents = self.es_client.search(query, page)
        return [
            Result(
                title=document.get("title", ""),
                url=document.get("url", ""),
                abs=self.treat_content(
                    document.get("_snippet", "")
                    or document.get("summary", "")
                    or document.get("content", "")
                ),
            )
            for document in documents
        ]

    def treat_content(self, content: str) -> str:
        content = re.sub(r"</?(som|math)\d*>", "", content)
        content = re.sub(r"\s+", " ", content)
        return content.strip()
