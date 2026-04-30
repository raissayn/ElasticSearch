# Python Backend

Backend em Python com FastAPI para espelhar a base Java original.

## Como rodar

1. Instale as dependencias:

```bash
pip install -r requirements.txt
```

2. Inicie a API:

```bash
uvicorn app.main:app --reload --port 8080
```

3. Teste o endpoint:

```bash
curl "http://127.0.0.1:8080/v1/search?query=computador&page=1"
```
