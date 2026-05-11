from pydantic import BaseModel


class Result(BaseModel):
    title: str
    url: str
    abs: str