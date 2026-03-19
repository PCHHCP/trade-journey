# Tyche Frontend

Frontend application for Tyche, built with React, TypeScript, and Vite.
Tyche 的前端应用，基于 React、TypeScript 和 Vite。

## Local Development
本地开发

### Setup
初始化

```bash
cp .env.example .env.development
npm install
```

### Run
启动

```bash
npm run dev
```

The app runs on `http://localhost:5173` by default.
默认运行地址为 `http://localhost:5173`。

## Required Environment Variables
必填环境变量

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL`

## Useful Commands
常用命令

```bash
npm run dev
npm run type-check
npm run lint
npm run build
```

## Auth Notes
认证说明

- Supabase manages sign-in, sign-up, and OAuth in the browser.
- `VITE_API_URL` should point to the FastAPI backend, usually `http://localhost:8000`.
- After authentication, frontend requests should send the Supabase access token to the backend as a Bearer token.

- Supabase 负责浏览器侧的登录、注册和 OAuth。
- `VITE_API_URL` 应指向 FastAPI 后端，本地通常是 `http://localhost:8000`。
- 登录完成后，前端请求应把 Supabase access token 作为 Bearer token 发给后端。
