from pymongo import MongoClient
import os

MONGO_URI = os.getenv('MONGO_URI')

_client = None

def get_mongo_client():
    global _client
    if _client is None:
        if not MONGO_URI:
            raise RuntimeError('MONGO_URI is not set in environment')
        _client = MongoClient(MONGO_URI)
    return _client

def get_mongo_db(db_name=None):
    client = get_mongo_client()
    if db_name:
        return client[db_name]
    # If no db name, try to extract from URI or return default 'hospital'
    return client.get_default_database() or client['hospital']
