from elasticsearch import Elasticsearch

client = Elasticsearch("http://localhost:9200", verify_certs=False)
try:
    print(client.indices.exists(index="test"))
except Exception as e:
    print("WITH VERIFY_CERTS:", e)

client2 = Elasticsearch("http://localhost:9200")
try:
    print(client2.indices.exists(index="test"))
except Exception as e:
    print("WITHOUT VERIFY_CERTS:", e)
