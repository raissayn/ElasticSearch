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

## Indexacao de PDFs (UNI-5)

1. Crie o indice com o mapping versionado:

```bash
python scripts/create_unisearch_index.py --recreate
```

2. Revise o manifesto de documentos:

```text
data/documents_manifest.example.json
```

3. Rode uma extracao sem enviar dados:

```bash
python scripts/ingest_pdfs.py --dry-run
```

4. Rode a ingestao real no Elasticsearch:

```bash
python scripts/ingest_pdfs.py
```
