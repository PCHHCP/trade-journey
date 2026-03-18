# 前端质量规范

> 前端代码质量标准。

---

## 概述

代码质量通过 **ESLint**、**TypeScript 严格模式** 和 **Prettier** 保障。所有检查必须在提交代码前通过。

### 命令

```bash
cd frontend
npm run lint          # ESLint 检查
npm run type-check    # TypeScript 检查（tsc --noEmit）
npm run format        # Prettier 格式化
npm run build         # 完整生产构建（能发现所有错误）
npm run preview       # 本地预览生产构建
```

---

## 禁止模式

| 模式 | 原因 | 替代方案 |
|------|------|---------|
| 生产代码中的 `console.log` | 生产环境噪音 | 删除或使用条件日志 |
| `any` 类型 | 破坏类型安全 | 使用 `unknown` 并缩窄 |
| 内联样式 `style={{}}` | 样式不一致 | 使用 Tailwind 类名 |
| 用 `useEffect` 请求数据 | 竞态条件、无缓存 | 使用 TanStack Query |
| 直接操作 DOM | 绕过 React | 使用 ref 或 state |
| default export 组件 | 难以重构和搜索 | 使用 named export |
| `var` 关键字 | 作用域问题 | 使用 `const` 或 `let` |
| 嵌套三元表达式 | 可读性差 | 使用提前 return 或变量 |
| 硬编码 API 地址 | 跨环境失效 | 使用 `import.meta.env.VITE_API_URL` |

---

## 必须遵守的模式

| 模式 | 原因 |
|------|------|
| 路由页面使用 Error Boundary | 优雅的错误处理 |
| 异步操作显示 Loading 状态 | 更好的用户体验 |
| 条件类名使用 `cn()` | 一致的类名合并 |
| 所有表单输入使用 Zod 校验 | 运行时类型安全 |
| 统一使用 API 客户端（`lib/api.ts`） | 一致的错误处理和认证头 |

---

## 测试要求

### 工具

- **Vitest** 用于单元测试
- **React Testing Library** 用于组件测试
- **Playwright** 用于 E2E 测试（后续添加）

### 需要测试

- 工具函数：必须有单元测试
- 自定义 Hook：使用 `renderHook` 测试
- 复杂组件：测试用户交互
- MT5 文件解析逻辑：必须有单元测试

### 不需要测试

- shadcn/ui 组件（上游已测试）
- 没有逻辑的简单展示组件
- Tailwind 类名组合

---

## 代码审查清单

- [ ] 没有 `any` 类型或 `@ts-ignore`
- [ ] Loading 和 Error 状态已处理
- [ ] 表单已使用 Zod 校验
- [ ] 无硬编码字符串（使用常量或 i18n）
- [ ] 无障碍访问（语义化 HTML、键盘导航）
- [ ] API 调用通过统一的 `api` 客户端
- [ ] `npm run build` 无错误通过
