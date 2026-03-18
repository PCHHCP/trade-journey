# 后端质量规范

> 后端代码质量标准。

---

## 概述

后端代码质量通过 **Ruff**（代码检查 + 格式化）、**mypy**（类型检查）和 **pytest**（测试）保障。所有检查必须在提交代码前通过。

### 命令

```bash
cd backend
ruff check .          # 代码检查
ruff format .         # 代码格式化
mypy app/             # 类型检查
pytest                # 运行测试
alembic check         # 验证迁移是否是最新的
```

---

## 禁止模式

| 模式 | 原因 | 替代方案 |
|------|------|---------|
| 业务逻辑写在 Router 中 | 路由不可测试 | 抽取到 Service 层 |
| `print()` 打日志 | 无级别、不可配置 | 使用 `logging` 模块 |
| `Any` 类型 | 破坏类型安全 | 使用具体类型 |
| ORM 支持的查询却用原生 SQL | SQL 注入风险、失去类型安全 | 使用 SQLAlchemy 查询 API |
| 硬编码密钥 | 安全风险 | 通过 `pydantic-settings` 使用环境变量 |
| 在异步代码中使用同步 DB 操作 | 阻塞事件循环 | 使用 `sqlalchemy.ext.asyncio` |
| 可变默认参数 | 共享状态 Bug | 默认值用 `None`，在函数体内赋值 |
| `from module import *` | 污染命名空间 | 导入具体名称 |
| 裸 `except:` | 会捕获 `SystemExit` 等 | 捕获具体异常类 |

---

## 必须遵守的模式

| 模式 | 原因 |
|------|------|
| 所有 API 输入输出使用 Pydantic Schema | 运行时校验 + 自动文档 |
| 业务逻辑放在 Service 层 | 职责分离、可测试性 |
| 异步 DB Session 通过依赖注入提供 | 资源管理清晰 |
| 使用自定义异常类 | 错误处理一致 |
| 使用 `pydantic-settings` 管理配置 | 类型安全的环境变量管理 |
| 所有函数添加类型注解 | 可读性 + mypy 检查 |

---

## 测试要求

### 工具

- **pytest** + **pytest-asyncio** 用于异步测试
- **httpx** `AsyncClient` 用于 API 集成测试

### 需要测试

- Service 层函数（业务逻辑）
- MT5 文件解析（边界情况、不同格式）
- API 接口（集成测试）
- Pydantic Schema（校验边界情况）

### 测试结构

```python
# tests/test_trades.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_trade(client: AsyncClient):
    response = await client.post("/api/v1/trades", json={
        "order_number": "12345",
        "symbol": "EURUSD",
        "side": "LONG",
        "entry_price": 1.1000,
        "quantity": 1.0,
    })
    assert response.status_code == 201
    assert response.json()["order_number"] == "12345"

@pytest.mark.asyncio
async def test_duplicate_order_number(client: AsyncClient):
    # 第一次导入
    await client.post("/api/v1/trades", json={...})
    # 重复导入
    response = await client.post("/api/v1/trades", json={...})
    assert response.status_code == 409
```

### 不需要测试

- SQLAlchemy / FastAPI 框架内部逻辑
- 生成的类型
- 无自定义逻辑的简单透传函数

---

## 代码审查清单

- [ ] 请求/响应已定义 Pydantic Schema
- [ ] 业务逻辑在 Service 层，不在 Router 中
- [ ] 正确的错误处理（自定义异常类、无裸 except）
- [ ] 所有函数有类型注解
- [ ] 未记录敏感数据
- [ ] 数据库查询已优化（无 N+1、正确使用 `include`）
- [ ] 模型变更后已创建 Alembic 迁移
- [ ] `ruff check .` 和 `mypy app/` 通过
- [ ] 新功能已编写测试
