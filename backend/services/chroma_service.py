import chromadb

client = chromadb.PersistentClient(
    path="./chroma_db"
)

collection = client.get_or_create_collection(
    name="memories"
)

def add_memory(memory_id, text):

    collection.add(
        documents=[text],
        ids=[str(memory_id)]
    )

def search_memories(query, n_results=3):

    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )

    return results
