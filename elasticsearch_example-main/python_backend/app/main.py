from fastapi import FastAPI

from app.controllers.search_controller import router
from app.core.config import settings

app = FastAPI(title="Elasticsearch Search API - Python", version="1.0.0")
app.include_router(router, prefix=settings.api_prefix)
