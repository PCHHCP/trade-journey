# 后端目录结构

> 后端代码的组织方式。

---

## 概述

后端使用 **Python 3.12** + **FastAPI** 框架，**SQLAlchemy 2.0**（异步模式）作为 ORM，**PostgreSQL 16** 作为数据库。项目采用模块化结构，路由、服务和数据访问层职责分明。

---

## 目录布局

```
backend/
├── main.py                     # FastAPI 应用入口
├── pyproject.toml              # 依赖管理（uv / poetry）
├── alembic.ini                 # Alembic 迁移配置
├── alembic/                    # 数据库迁移文件
│   ├── env.py
│   └── versions/
├── app/
│   ├── __init__.py
│   ├── config.py               # 配置管理（pydantic-settings）
│   ├── database.py             # 数据库引擎与会话
│   ├── dependencies.py         # FastAPI 依赖注入（get_db、get_current_user）
│   ├── models/                 # SQLAlchemy 模型
│   │   ├── __init__.py
│   │   ├── base.py             # 基础模型类
│   │   ├── trade.py
│   │   └── user.py
│   ├── schemas/                # Pydantic Schema（请求/响应）
│   │   ├── __init__.py
│   │   ├── trade.py
│   │   └── user.py
│   ├── routers/                # API 路由处理器
│   │   ├── __init__.py
│   │   ├── trades.py
│   │   ├── auth.py
│   │   ├── import_.py          # MT5 文件导入接口
│   │   └── analytics.py
│   ├── services/               # 业务逻辑层
│   │   ├── __init__.py
│   │   ├── trade.py
│   │   ├── import_.py          # MT5 文件解析逻辑
│   │   └── analytics.py
│   └── utils/                  # 辅助函数
│       ├── __init__.py
│       └── mt5_parser.py       # MT5 导出文件解析器
└── tests/
    ├── conftest.py
    ├── test_trades.py
    └── test_import.py
```

---

## 模块组织

### 分层职责

| 层级 | 目录 | 职责 |
|------|------|------|
| **路由层** | `app/routers/` | HTTP 处理、请求校验、响应格式化 |
| **服务层** | `app/services/` | 业务逻辑、流程编排 |
| **模型层** | `app/models/` | SQLAlchemy ORM 模型（数据库表） |
| **Schema 层** | `app/schemas/` | Pydantic 模型，用于请求/响应校验 |

### 数据流

```
请求 → Router → Service → Model/DB → Service → Schema → 响应
```

路由层应保持精简——校验输入、调用服务、返回响应：

```python
# app/routers/trades.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db
from app.schemas.trade import TradeResponse, TradeCreate
from app.services.trade import TradeService

router = APIRouter(prefix="/trades", tags=["trades"])

@router.get("/", response_model=list[TradeResponse])
async def list_trades(db: AsyncSession = Depends(get_db)):
    service = TradeService(db)
    return await service.get_all()

@router.post("/", response_model=TradeResponse, status_code=201)
async def create_trade(data: TradeCreate, db: AsyncSession = Depends(get_db)):
    service = TradeService(db)
    return await service.create(data)
```

---

## 命名规范

| 类型 | 约定 | 示例 |
|------|------|------|
| 模块 | snake_case | `trade.py`、`mt5_parser.py` |
| 类 | PascalCase | `TradeService`、`TradeResponse` |
| 函数 | snake_case | `get_all_trades`、`parse_mt5_file` |
| SQLAlchemy 模型 | PascalCase 单数 | `Trade`、`User` |
| Pydantic Schema | PascalCase + 后缀 | `TradeCreate`、`TradeResponse`、`TradeUpdate` |
| 路由文件 | snake_case | `trades.py`、`import_.py` |
| 测试文件 | `test_` 前缀 | `test_trades.py` |
| 常量 | UPPER_SNAKE_CASE | `MAX_IMPORT_SIZE` |

---

## 示例

随着代码库的增长，将补充真实的文件引用。
