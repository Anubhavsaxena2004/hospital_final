"""Seed MongoDB with unstructured collections and indexes for the Hospital/Map projects.

Reads MONGO_URI and optional MONGO_DB_NAME from environment.
"""
import os
from pymongo import MongoClient, errors
from datetime import datetime

MONGO_URI = os.getenv('MONGO_URI')
DB_NAME = os.getenv('MONGO_DB_NAME') or 'hospital_unstructured'

if not MONGO_URI:
    print('ERROR: MONGO_URI is not set in environment. Aborting.')
    raise SystemExit(1)

print('Connecting to MongoDB...')
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Trigger server selection / connect
    client.admin.command('ping')
except Exception as e:
    print('Failed to connect to MongoDB:', e)
    raise SystemExit(2)

# Get database: prefer database embedded in URI; otherwise use fallback MONGO_DB_NAME
try:
    # get_default_database() raises ConfigurationError when no default is configured
    db = client.get_default_database()
    if db is None:
        raise errors.ConfigurationError('No default database in URI')
    print('Using default db from URI:', db.name)
except errors.ConfigurationError:
    # Use explicit DB name from env or fallback
    db = client[DB_NAME]
    print('No default DB in URI; using db:', DB_NAME)

# Collections and example docs
collections = {
    'ambulance_live_logs': {
        'sample': {
            'ambulance_id': 'AMB-101',
            'timestamp': datetime.utcnow(),
            'location': { 'type': 'Point', 'coordinates': [80.9967, 26.8893] },
            'speed': 62.5,
            'fuel': 40,
            'battery': 88,
            'meta': {'accuracy': 5}
        },
        'indexes': [ ('location', '2dsphere') ]
    },
    'incident_timeline': {
        'sample': {
            'incident_id': 155,
            'timeline': [
                {'ts': datetime.utcnow(), 'event': 'created', 'meta': {}},
            ]
        },
        'indexes': [ ('incident_id', 1) ]
    },
    'patient_condition_media': {
        'sample': {
            'incident_id': 155,
            'media': [
                {'id':'m1','type':'image','storage_url':'s3://bucket/img1.jpg','uploaded_at': datetime.utcnow()}
            ]
        },
        'indexes': [ ('incident_id', 1) ]
    },
    'hospital_event_log': {
        'sample': {
            'hospital_id': 12,
            'events': [ {'ts': datetime.utcnow(), 'type':'bed_reserved', 'bed_number':'E-14', 'incident_id':155} ]
        },
        'indexes': [ ('hospital_id', 1) ]
    },
    'hospital_alerts': {
        'sample': {
            'incident_id': 155,
            'alerts': [ {'to':'family','method':'sms','status':'sent','ts': datetime.utcnow()} ]
        },
        'indexes': [ ('incident_id', 1) ]
    }
}

results = {}
for coll_name, spec in collections.items():
    coll = db[coll_name]
    print('\nCollection:', coll_name)
    # Create indexes
    for idx in spec['indexes']:
        if idx[1] == '2dsphere':
            try:
                coll.create_index([(idx[0], '2dsphere')])
                print('  Created 2dsphere index on', idx[0])
            except Exception as ex:
                print('  Failed to create 2dsphere index:', ex)
        else:
            try:
                coll.create_index([(idx[0], idx[1])])
                print('  Created index on', idx)
            except Exception as ex:
                print('  Failed to create index:', ex)
    # Insert sample document if not present
    sample = spec['sample']
    try:
        existing = coll.find_one(sample)
        if existing:
            print('  Sample document already exists with _id:', existing.get('_id'))
            results[coll_name] = existing.get('_id')
        else:
            res = coll.insert_one(sample)
            print('  Inserted sample document _id:', res.inserted_id)
            results[coll_name] = res.inserted_id
    except Exception as ex:
        print('  Failed to insert sample document:', ex)

print('\nDone. Collections created/seeded:')
for k,v in results.items():
    print(f' - {k}: {v}')

print('\nYou can connect to your MongoDB at the host/cluster listed in the MONGO_URI you provided.')
print('If you used Atlas, open MongoDB Atlas UI or use MongoDB Compass and connect using that connection string.')
