# Hospital — Emergency Dispatch & Multi-Tenant Hospital

This repository contains two main services:

- `backend/` — Django multi-tenant hospital management (Postgres structured, Mongo for unstructured data)
- `map_service/` — Flask map/ambulance/incident service (Postgres or SQLite for lightweight structured data, Mongo for telemetry)

This README explains how to configure environment variables, run migrations, and start services.

---

## Environment variables
Create a `.env` file for each service (examples are provided in `backend/.env` and `map_service/.env`). Do NOT commit `.env` to source control.

Required variables:

- `DATABASE_URL` — PostgreSQL connection string for structured data (Django). Example:
  ```
  postgresql://<user>:<password>@<host>:<port>/<dbname>
  ```

- `MONGO_URI` — MongoDB connection string for telemetry and unstructured data. Example:
  ```
  mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
  ```

Optional:
- `POSTGRES_URL` — If the map service uses Postgres.

Example (backend/.env):

```
DATABASE_URL="postgresql://postgres:oMMXnLKmwnsWfdkkdoiNIHxjldbgeoTb@shortline.proxy.rlwy.net:47374/railway"
MONGO_URI="mongodb+srv://Hospital_ry:<Rohit321>@hospital.wabbsrz.mongodb.net/?appName=Hospital"
```

**Security note:** These credentials are sensitive. Rotate and store them in a secrets manager (AWS Secrets Manager, Vault, Azure Key Vault) for production.

---

## Backend (Django) — Quick start

1. Create a Python virtual environment and activate it:

```bash
python -m venv .venv
source .venv/bin/activate  # on Windows: .venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r backend/requirements.txt
```

3. Export environment variables (or use a `.env` loader in production):

```bash
export DATABASE_URL="postgresql://..."
export MONGO_URI="mongodb+srv://..."
```

4. Make & apply migrations:

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

5. Create a superuser and run server:

```bash
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

6. Apply recommended Postgres indexes (optional):

```bash
psql -d <yourdb> -f db/indexes.sql
```

---

## Map service (Flask) — Quick start

1. Create and activate a venv, then install Flask and dependencies (add a `requirements.txt` if you add more):

```bash
python -m venv .venv
source .venv/bin/activate
pip install flask flask_sqlalchemy pymongo
```

2. Export env vars and run the map service (example):

```bash
export MONGO_URI="mongodb+srv://..."
export DATABASE_URL="postgresql://..."  # if used
python -m map_service.app
```

---

## MongoDB helpers
Utility clients are provided in:

- `backend/utils/mongo_client.py`
- `map_service/mongo_client.py`

They read `MONGO_URI` from the environment and provide `get_mongo_client()` and `get_mongo_db()` helpers.

---

## Migrations
- Django migrations: use `python manage.py makemigrations` and `migrate`.
- Flask (Alembic): see `backend/db_migrations/alembic_changes.md` for example snippets.

---

## Next steps / Suggestions
- Move secrets to a secrets manager and reference them via environment variables in your deployment system.
- Use `dj-database-url` for robust parsing of `DATABASE_URL` in Django (`pip install dj-database-url`).
- For production MongoDB Atlas, configure IP allowlists and rotate keys.
- Use Docker Compose to run Postgres + Mongo locally for development.

---

If you want, I can:
- Generate Docker Compose for local dev with Postgres + Mongo + Django + Flask
- Create the Alembic file(s) for `map_service`
- Produce an OpenAPI spec for the Map ↔ Hospital APIs

Tell me which of these I should do next.
