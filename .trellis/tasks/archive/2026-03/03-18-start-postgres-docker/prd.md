# Start PostgreSQL 16 Docker

## Goal
Provide a local PostgreSQL 16 development environment for this repository using Docker.

## Requirements
- Add a Docker Compose configuration that starts PostgreSQL 16 locally.
- Use environment variables for database name, user, password, host port, and data volume.
- Provide a checked-in example env file with sane local defaults.
- Document the exact commands to start, stop, and inspect the database container.

## Acceptance Criteria
- [ ] `docker compose up -d` can start a PostgreSQL 16 container from the repo root.
- [ ] The container exposes PostgreSQL on a configurable local port.
- [ ] Database data persists across container restarts.
- [ ] The repo contains concise setup instructions for local development.

## Technical Notes
- No backend application code exists yet, so this task only sets up the database runtime and docs.
- Prefer a minimal Compose setup that can be reused by the future FastAPI backend.
