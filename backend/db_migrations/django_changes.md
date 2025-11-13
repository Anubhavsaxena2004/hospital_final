# Django raw-SQL migration hints for Hospital app

To add reservation fields to `beds` table (raw SQL):

```sql
ALTER TABLE beds ADD COLUMN is_reserved_for_incident boolean DEFAULT false;
ALTER TABLE beds ADD COLUMN reserved_incident_id integer;
ALTER TABLE beds ADD COLUMN reserved_expiry_time timestamptz NULL;
ALTER TABLE beds ADD COLUMN severity_level varchar(20) DEFAULT 'medium';
```

After adding fields to `beds/models.py`, run:

```bash
python manage.py makemigrations beds
python manage.py migrate
```

To add `lat`/`lng` to `hospitals`:

```sql
ALTER TABLE hospitals ADD COLUMN lat double precision;
ALTER TABLE hospitals ADD COLUMN lng double precision;
ALTER TABLE hospitals ADD COLUMN alert_family_enabled boolean DEFAULT true;
ALTER TABLE hospitals ADD COLUMN alert_police_enabled boolean DEFAULT false;
ALTER TABLE hospitals ADD COLUMN average_handling_minutes integer DEFAULT 15;
```

Then `makemigrations` / `migrate` as usual.
