# 前端状态管理

> 状态的管理方式和分层策略。

---

## 概述

状态按职责分层管理：

| 层级 | 工具 | 用途 |
|------|------|------|
| 服务端状态 | TanStack Query | 来自 FastAPI 后端的 API 数据 |
| 全局客户端状态 | Zustand | 跨组件共享的 UI 状态（主题、侧边栏、筛选器） |
| 局部状态 | React `useState` | 仅当前组件使用的 UI 状态 |
| URL 状态 | React Router `searchParams` | 筛选条件、分页、Tab 选择 |
| 表单状态 | React Hook Form + Zod | 表单输入和校验 |

---

## 状态分类

### 服务端状态（TanStack Query）

所有来自后端 API 的数据。**严禁将 API 返回数据存入 Zustand**。

```tsx
// 正确：TanStack Query 管理服务端状态
const { data: trades } = useTrades();

// 错误：不要把服务端数据复制到 Zustand
// const setTrades = useTradeStore(s => s.setTrades);
// useEffect(() => setTrades(data), [data]);
```

### 全局客户端状态（Zustand）

仅用于多个组件需要共享的 UI 状态：

```tsx
// stores/uiStore.ts
import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
```

### 局部状态（useState）

仅属于单个组件的状态：

```tsx
const [isEditing, setIsEditing] = useState(false);
```

### URL 状态（searchParams）

需要持久化在 URL 中的状态（可分享、可收藏）：

```tsx
import { useSearchParams } from "react-router-dom";

const [searchParams, setSearchParams] = useSearchParams();
const status = searchParams.get("status") ?? "all";
```

---

## 何时使用全局状态

只有满足以下条件时才将状态提升到 Zustand：

- 两个或以上**不相关的**组件需要同一状态
- 该状态需要在页面导航间保持
- 该状态是纯客户端的（非服务端数据）

如果都不满足，使用局部 `useState`。

---

## 服务端状态策略

### 缓存策略

- 大部分查询默认 `staleTime`：5 分钟
- 交易列表：窗口聚焦时自动重新请求
- 变更操作后使用 `queryClient.invalidateQueries` 刷新缓存

### 乐观更新

用于提升变更操作的用户体验：

```tsx
useMutation({
  mutationFn: deleteTrade,
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ["trades"] });
    const previous = queryClient.getQueryData(["trades"]);
    queryClient.setQueryData(["trades"], (old: Trade[]) =>
      old.filter((t) => t.id !== id)
    );
    return { previous };
  },
  onError: (_err, _id, context) => {
    queryClient.setQueryData(["trades"], context?.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["trades"] });
  },
});
```

---

## 常见错误

| 错误做法 | 正确做法 |
|---------|---------|
| 把服务端数据存入 Zustand | 所有服务端状态使用 TanStack Query |
| 为单组件状态创建 Store | 使用 `useState` |
| 筛选/分页不用 URL 状态 | 使用 `searchParams` 让 URL 可分享 |
| 超过 3 层的 props 透传 | 考虑使用 Zustand 或 React Context |
