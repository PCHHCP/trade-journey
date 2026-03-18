# 前端目录结构

> 前端代码的组织方式。

---

## 概述

本项目前端使用 **React 19 + TypeScript**，构建工具为 **Vite 6**。前端是独立的 SPA 应用，通过 REST API 与 Python FastAPI 后端通信。路由使用 **React Router v7**。

---

## 目录布局

```
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── tailwind.config.ts
└── src/
    ├── main.tsx                # 应用入口
    ├── App.tsx                 # 根组件（Provider、Router 配置）
    ├── index.css               # 全局样式（Tailwind 导入）
    ├── routes/                 # 页面级组件（对应路由）
    │   ├── Dashboard.tsx
    │   ├── TradeList.tsx
    │   ├── TradeDetail.tsx
    │   ├── Import.tsx          # MT5 文件导入页面
    │   └── Analytics.tsx       # 统计与图表
    ├── components/             # 共享组件
    │   ├── ui/                 # shadcn/ui 基础组件（自动生成）
    │   ├── layout/             # 布局组件（Header、Sidebar、Footer）
    │   └── trade/              # 交易相关组件
    ├── hooks/                  # 自定义 React Hooks
    ├── lib/                    # 工具函数与配置
    │   ├── api.ts              # API 客户端（fetch 封装）
    │   ├── utils.ts            # 通用工具（cn 辅助函数等）
    │   └── validations/        # Zod 校验 Schema
    ├── stores/                 # Zustand 状态仓库
    ├── types/                  # 共享 TypeScript 类型定义
    └── config/                 # 应用配置常量
```

---

## 模块组织

### 路由页面

每个路由对应 `src/routes/` 下的一个页面组件：

```
routes/
├── Dashboard.tsx       # /
├── TradeList.tsx        # /trades
├── TradeDetail.tsx      # /trades/:id
├── Import.tsx           # /import
└── Analytics.tsx        # /analytics
```

### 按功能分组组件

按功能领域组织组件，而非按类型：

```
components/
├── ui/              # shadcn/ui 基础组件（Button、Input、Card 等）
├── layout/          # 全局布局组件（Header、Sidebar）
├── trade/           # 交易功能组件
│   ├── TradeForm.tsx
│   ├── TradeCard.tsx
│   ├── TradeTable.tsx
│   └── TradeFilters.tsx
├── import/          # MT5 导入功能组件
│   ├── FileUploader.tsx
│   └── ImportPreview.tsx
└── analytics/       # 统计分析功能组件
    ├── PnLChart.tsx
    └── WinRateCard.tsx
```

### 就近放置规则

- **页面专属组件**：如果只在某一个路由页面使用，放在 `components/{feature}/`
- **共享组件**：放在 `components/ui/` 或 `components/layout/`
- **功能相关 Hook**：放在 `hooks/`，使用描述性命名

---

## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 路由页面 | PascalCase | `TradeList.tsx` |
| 组件 | PascalCase | `TradeCard.tsx` |
| Hook | camelCase + `use` 前缀 | `useTrades.ts` |
| 工具函数 | camelCase | `formatCurrency.ts` |
| 类型文件 | PascalCase | `trade.ts`（在 `types/` 下） |
| Store | camelCase + `Store` 后缀 | `uiStore.ts` |
| API 客户端 | camelCase | `api.ts` |
| 目录 | kebab-case 或 camelCase | `trade/`、`hooks/` |

---

## 示例

随着代码库的增长，将补充真实的文件引用。
