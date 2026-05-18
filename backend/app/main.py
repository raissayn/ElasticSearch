from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.controllers.search_controller import router

app = FastAPI(
    title="Sample API",
    version="1.0.0",
    description="Initial example to submit Elasticsearch queries"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/v1")