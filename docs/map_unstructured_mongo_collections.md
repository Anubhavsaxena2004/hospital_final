# Map Service - Unstructured MongoDB Collections

## ambulance_live_logs
One document per high-frequency ping (store raw telemetry here).

Example:

```json
{
  "_id": "ObjectId(...)",
  "ambulance_id": "AMB-101",
  "timestamp": "2025-11-13T10:20:00Z",
  "location": { "type": "Point", "coordinates": [80.9967, 26.8893] },
  "speed": 62.5,
  "fuel": 40,
  "battery": 88,
  "meta": { "accuracy": 5 }
}
```

Notes:
- Create a `2dsphere` index on `location` for geo queries:
  `db.ambulance_live_logs.createIndex({ location: '2dsphere' })`
- Keep raw telemetry and references to archived files here.

## incident_timeline
Store timeline events for incidents (audit + state transitions).

Example:

```json
{
  "incident_id": 155,
  "timeline": [
    {"ts":"2025-11-13T10:00:00Z","event":"created","meta":{}},
    {"ts":"2025-11-13T10:05:00Z","event":"ambulance_assigned","meta":{"ambulance_id":"AMB-101"}}
  ]
}
```

Index suggestion: `db.incident_timeline.createIndex({ incident_id: 1 })`

## patient_condition_media
Large media references for incidents/patients.

Example:

```json
{
  "incident_id": 155,
  "media": [
    {"id":"m1","type":"image","storage_url":"s3://.../img1.jpg","uploaded_at":"2025-11-13T10:10:00Z"}
  ]
}
```

Notes:
- Store metadata and thumbnails here; actual blobs go to S3/MinIO.
