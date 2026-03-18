# Web Journey

## Local PostgreSQL 16

This repository includes a minimal Docker Compose setup for local PostgreSQL 16.

### Quick start

```bash
docker compose up -d
docker compose ps
docker compose logs postgres
```

The default connection settings are:

- Host: `localhost`
- Port: `5432`
- Database: `web_journey`
- User: `postgres`
- Password: `postgres`

### Customize settings

If you want to change the local database settings, create a local `.env` file:

```bash
cp .env.example .env
```

Then edit these variables:

- `POSTGRES_CONTAINER_NAME`
- `POSTGRES_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

### Common commands

```bash
docker compose up -d
docker compose down
docker compose down -v
docker compose logs -f postgres
docker compose exec postgres psql -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-web_journey}"
```

### Notes

- Data is persisted in the named volume `postgres_data`.
- `docker compose down` keeps data.
- `docker compose down -v` removes the database volume and deletes local data.
