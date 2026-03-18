# 前端类型安全

> 类型安全的模式和约定。

---

## 概述

本项目使用 **TypeScript** 严格模式。前端运行时校验使用 **Zod**，后端使用 **Pydantic**——两端类型应保持同步。共享类型定义放在 `src/types/`。

---

## 类型组织

```
src/
├── types/
│   ├── trade.ts        # 交易相关类型
│   ├── user.ts         # 用户相关类型
│   └── api.ts          # API 请求/响应类型
└── lib/
    └── validations/
        ├── trade.ts    # 交易相关 Zod Schema
        └── import.ts   # MT5 导入相关 Zod Schema
```

### 约定

- **API 响应类型**：在 `src/types/` 中定义，与后端 Pydantic 模型保持一致
- **表单校验**：Zod Schema 放在 `src/lib/validations/`
- **优先从 Zod Schema 推导类型**，避免重复定义

```tsx
// lib/validations/trade.ts
import { z } from "zod";

export const tradeFilterSchema = z.object({
  symbol: z.string().optional(),
  side: z.enum(["LONG", "SHORT"]).optional(),
  status: z.enum(["OPEN", "CLOSED"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type TradeFilters = z.infer<typeof tradeFilterSchema>;
```

```tsx
// types/trade.ts — 与后端 Pydantic 模型对应
export interface Trade {
  id: string;
  order_number: string;
  symbol: string;
  side: "LONG" | "SHORT";
  status: "OPEN" | "CLOSED";
  entry_price: number;
  exit_price?: number;
  quantity: number;
  pnl?: number;
  commission?: number;
  swap?: number;
  notes?: string;
  open_time: string;
  close_time?: string;
  created_at: string;
  updated_at: string;
}
```

---

## 校验

### 表单校验（客户端）

使用 Zod 配合 React Hook Form：

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tradeFilterSchema, type TradeFilters } from "@/lib/validations/trade";

const form = useForm<TradeFilters>({
  resolver: zodResolver(tradeFilterSchema),
});
```

### API 响应

信任后端 Pydantic 的校验结果。前端不需要重复校验 API 响应——在 API 客户端中通过 TypeScript 泛型做类型断言即可。

---

## 常用模式

### 工具类型

```tsx
// API 响应包装（与后端格式一致）
type ApiResponse<T> = {
  data: T;
  message?: string;
};

// 分页响应（与后端格式一致）
type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  page_size: number;
};
```

---

## 禁止模式

| 模式 | 原因 | 替代方案 |
|------|------|---------|
| `any` | 关闭类型检查 | 使用 `unknown` 并缩窄类型 |
| `as` 类型断言 | 绕过类型安全 | 使用类型守卫或 Zod 解析 |
| `// @ts-ignore` | 隐藏真实错误 | 修复类型错误 |
| `!` 非空断言 | 可能导致运行时错误 | 使用可选链或 null 检查 |
| 前后端重复定义类型 | 类型容易不同步 | `types/` 作为单一来源，对齐后端 Pydantic 模型 |
