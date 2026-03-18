# 前端组件规范

> 组件的编写方式和约定。

---

## 概述

本项目使用 **React 19 + TypeScript**，样式使用 **Tailwind CSS v4**，基础 UI 库使用 **shadcn/ui**。所有组件都是客户端组件（本项目是 Vite SPA，没有 SSR）。

---

## 组件结构

### 标准组件写法

```tsx
// components/trade/TradeCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Trade } from "@/types/trade";

interface TradeCardProps {
  trade: Trade;
  onEdit?: (id: string) => void;
  className?: string;
}

export function TradeCard({ trade, onEdit, className }: TradeCardProps) {
  const isProfit = trade.pnl !== undefined && trade.pnl > 0;

  return (
    <Card className={cn("cursor-pointer hover:shadow-md", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{trade.symbol}</span>
          <Badge variant={trade.side === "LONG" ? "default" : "destructive"}>
            {trade.side}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={cn("text-lg font-bold", isProfit ? "text-green-600" : "text-red-600")}>
          {trade.pnl?.toFixed(2)}
        </p>
      </CardContent>
    </Card>
  );
}
```

---

## Props 约定

- 使用 `interface` 定义 Props，命名为 `{组件名}Props`
- 在函数参数中使用解构
- 避免展开未知的 props（`...rest`），除非在构建包装组件

```tsx
interface TradeCardProps {
  trade: Trade;
  onEdit?: (id: string) => void;
  className?: string;
}

export function TradeCard({ trade, onEdit, className }: TradeCardProps) {
  // ...
}
```

---

## 样式规范

- 直接在 JSX 中使用 **Tailwind CSS** 工具类
- 条件样式使用 `cn()` 辅助函数（来自 `lib/utils.ts`）
- shadcn/ui 组件是基础——通过 Tailwind 自定义，不要覆盖其内部实现

```tsx
import { cn } from "@/lib/utils";

<div className={cn("p-4 rounded-lg", isProfit ? "bg-green-50" : "bg-red-50")} />
```

---

## 无障碍访问

- 使用语义化 HTML 元素（`<main>`、`<nav>`、`<section>`、`<article>`）
- 所有可交互元素必须支持键盘操作
- 图片必须有 `alt` 属性
- 表单输入必须关联 label
- shadcn/ui 组件已处理大部分无障碍问题——不要覆盖 aria 属性

---

## 常见错误

| 错误做法 | 正确做法 |
|---------|---------|
| 所有元素都用 `<div>` | 使用语义化 HTML 元素 |
| 使用内联样式 `style={{}}` | 使用 Tailwind 类名 |
| 自己造 UI 基础组件 | 使用 shadcn/ui 组件 |
| 使用 default export | 使用 named export |
| 单个组件文件超过 300 行 | 拆分为更小的子组件 |
| 超过 3 层的 props 透传 | 使用 Zustand 或 Context |
