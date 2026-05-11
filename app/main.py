from fastapi import FastAPI
from app.controllers.search_controller import router

app = FastAPI(
    title="Sample API",
    version="1.0.0",
    description="Initial example to submit Elasticsearch queries"
)

app.include_router(router, prefix="/v1")