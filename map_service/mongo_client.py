from pymongo import MongoClient
import os

MONGO_URI = os.getenv('MONGO_URI')

def get_mongo_client():
    if not MONGO_URI:
        raise RuntimeError('MONGO_URI is not set in environment for map_service')
    return MongoClient(MONGO_URI)

def get_mongo_db(db_name=None):
    client = get_mongo_client()
    if db_name:
        return client[db_name]
    return client.get_default_database() or client['hospital']
