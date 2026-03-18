# 前端 Hook 规范

> 自定义 Hook 的使用方式和约定。

---

## 概述

自定义 Hook 用于封装可复用的有状态逻辑。数据请求使用 **TanStack Query (React Query v5)** 与 FastAPI 后端通信。所有 Hook 放在 `src/hooks/` 目录下。

---

## 自定义 Hook 模式

### 基本结构

```tsx
// hooks/useTrades.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Trade, CreateTradeInput } from "@/types/trade";

export function useTrades(filters?: TradeFilters) {
  return useQuery({
    queryKey: ["trades", filters],
    queryFn: () => api.get<Trade[]>("/trades", { params: filters }),
  });
}

export function useCreateTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTradeInput) => api.post<Trade>("/trades", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
  });
}
```

### 规则

- 每个文件一个 Hook，文件名与 Hook 同名
- 使用 named export（非 default export）
- 保持 Hook 职责单一——每个 Hook 只负责一件事
- 把复杂逻辑抽入 Hook，保持组件精简

---

## 数据请求

### API 客户端

所有 HTTP 请求通过集中的 API 客户端发出：

```tsx
// lib/api.ts
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

export const api = {
  async get<T>(path: string, options?: { params?: Record<string, string> }): Promise<T> {
    const url = new URL(`${API_BASE}${path}`);
    if (options?.params) {
      Object.entries(options.params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    const res = await fetch(url);
    if (!res.ok) throw new ApiError(res);
    return res.json();
  },

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new ApiError(res);
    return res.json();
  },
  // put、delete 类似...
};
```

### 所有 API 调用必须使用 TanStack Query

```tsx
// hooks/useTrades.ts
export function useTrades() {
  return useQuery({
    queryKey: ["trades"],
    queryFn: () => api.get<Trade[]>("/trades"),
  });
}
```

### Query Key 约定

- 使用数组格式：`["resource", params]`
- 保持层级关系：`["trades"]`、`["trades", id]`、`["trades", { status: "open" }]`

---

## 命名规范

| 模式 | 约定 | 示例 |
|------|------|------|
| 数据查询 | `use{资源}` | `useTrades`、`useTradeById` |
| 数据变更 | `use{动作}{资源}` | `useCreateTrade`、`useDeleteTrade` |
| 文件导入 | `useImport{来源}` | `useImportMT5` |
| UI 逻辑 | `use{行为}` | `useMediaQuery`、`useDebounce` |
| 表单 Hook | `use{资源}Form` | `useTradeForm` |

---

## 常见错误

| 错误做法 | 正确做法 |
|---------|---------|
| 用 `useEffect` + `fetch` 手动请求 | 使用 TanStack Query |
| 用 `useState` + `useEffect` 处理派生数据 | 使用 `useMemo` 或直接计算 |
| 条件调用 Hook | Hook 必须在顶层无条件调用 |
| 变更后不刷新查询 | 在 `onSuccess` 中始终 invalidate 相关查询 |
| 在 Hook 中硬编码 API 地址 | 使用集中的 `api` 客户端 |
