# Tyche

Trading journal web application.
交易日志 Web 应用。

## Stack
技术栈

- Frontend: React + TypeScript + Vite + Supabase Auth
- Backend: FastAPI + SQLAlchemy + Alembic
- Database: PostgreSQL 16

## Prerequisites
环境要求

- Docker
- Node.js 20+
- `uv`

## Local Development
本地开发

### 1. Start PostgreSQL
启动本地 PostgreSQL

```bash
docker compose up -d
docker compose ps
docker compose logs postgres
```

Default connection settings:
默认连接信息：

- Host: `localhost`
- Port: `5432`
- Database: `tyche`
- User: `postgres`
- Password: `postgres`

If you want to override them, create a root `.env` file:
如果你想覆盖默认数据库配置，在仓库根目录创建 `.env`：

```bash
cp .env.example .env
```

Supported variables:
可配置变量：

- `POSTGRES_CONTAINER_NAME`
- `POSTGRES_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

### 2. Start the backend
启动后端服务

```bash
cd backend
cp .env.example .env
uv sync
uv run alembic upgrade head
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend environment variables:
后端必填环境变量：

- `DATABASE_URL`
- `SUPABASE_JWT_SECRET`
- `CORS_ORIGINS`
- `DEBUG`

Default local API URL: `http://localhost:8000`
本地默认后端地址：`http://localhost:8000`

### 3. Start the frontend
启动前端服务

```bash
cd frontend
cp .env.example .env.development
npm install
npm run dev
```

Frontend environment variables:
前端必填环境变量：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL`

Default local frontend URL: `http://localhost:5173`
本地默认前端地址：`http://localhost:5173`

## Authentication Flow
认证链路说明

- Supabase handles sign-in, sign-up, and OAuth callback in the frontend.
- The frontend sends the Supabase access token to the backend as a Bearer token.
- The backend verifies the token with `SUPABASE_JWT_SECRET`.
- The backend provisions a local record in the `users` table on first authenticated access.

- Supabase 负责前端登录、注册和 OAuth 回调。
- 前端会把 Supabase access token 作为 Bearer token 发送给后端。
- 后端使用 `SUPABASE_JWT_SECRET` 校验 token。
- 后端在用户首次通过认证访问时，会自动在 `users` 表中创建本地记录。

## Common Commands
常用命令

### Database
数据库

```bash
docker compose up -d
docker compose down
docker compose down -v
docker compose logs -f postgres
docker compose exec postgres psql -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-tyche}"
```

### Backend
后端

```bash
cd backend
uv sync
uv run alembic upgrade head
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
uv run pytest -q
uv run mypy main.py app
```

### Frontend
前端

```bash
cd frontend
npm install
npm run dev
npm run type-check
npm run build
```

## Notes
说明

- `uv` manages the Python environment and dependencies for the backend. There is no need to create or maintain a manual `.venv` for this project workflow.
- Data is persisted in the named volume `postgres_data`.
- `docker compose down` keeps data.
- `docker compose down -v` removes the database volume and deletes local data.

- `uv` 负责后端 Python 环境和依赖管理，不需要再手动维护 `.venv`。
- 数据保存在 Docker volume `postgres_data` 中。
- `docker compose down` 会保留数据库数据。
- `docker compose down -v` 会连同数据库数据一起删除。
