# Hospital Service - Unstructured MongoDB Collections

## hospital_event_log
Audit trail for events that are not convenient to store in relational rows.

Example:

```json
{
  "hospital_id": 12,
  "events": [
    {"ts":"2025-11-13T10:12:00Z","type":"bed_reserved","bed_number":"E-14","incident_id":155}
  ]
}
```

Index suggestion: `db.hospital_event_log.createIndex({ hospital_id: 1 })`

## hospital_alerts
Keep a history of alerts sent for incidents (family, police, etc.)

Example:

```json
{
  "incident_id":155,
  "alerts": [
    {"to":"family","method":"sms","status":"sent","ts":"2025-11-13T10:13:00Z"}
  ]
}
```

Notes:
- Keep immutable audit records here; reference media or external logs by URL.
- Use TTL collections for ephemeral telemetry if desired.
