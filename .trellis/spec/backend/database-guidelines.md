# 后端数据库规范

> 数据库的使用模式和约定。

---

## 概述

本项目使用 **PostgreSQL 16** + **SQLAlchemy 2.0**（异步模式）作为 ORM。数据库迁移由 **Alembic** 管理。数据库会话通过 FastAPI 依赖注入提供。

---

## 数据库初始化

### 引擎与会话

```python
# app/database.py
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.config import settings

engine = create_async_engine(settings.database_url, echo=settings.debug)

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
```

### 基础模型

```python
# app/models/base.py
from datetime import datetime
from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
```

---

## 查询模式

### Service 中的基本 CRUD

```python
# app/services/trade.py
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.trade import Trade
from app.schemas.trade import TradeCreate, TradeUpdate

class TradeService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> list[Trade]:
        result = await self.db.execute(
            select(Trade).order_by(Trade.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, trade_id: str) -> Trade | None:
        return await self.db.get(Trade, trade_id)

    async def create(self, data: TradeCreate) -> Trade:
        trade = Trade(**data.model_dump())
        self.db.add(trade)
        await self.db.commit()
        await self.db.refresh(trade)
        return trade

    async def update(self, trade_id: str, data: TradeUpdate) -> Trade | None:
        trade = await self.get_by_id(trade_id)
        if not trade:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(trade, key, value)
        await self.db.commit()
        await self.db.refresh(trade)
        return trade

    async def delete(self, trade_id: str) -> bool:
        trade = await self.get_by_id(trade_id)
        if not trade:
            return False
        await self.db.delete(trade)
        await self.db.commit()
        return True
```

### Upsert（按订单号去重）

用于 MT5 导入时的去重处理：

```python
from sqlalchemy.dialects.postgresql import insert

async def upsert_trades(self, trades: list[TradeCreate]) -> int:
    stmt = insert(Trade).values([t.model_dump() for t in trades])
    stmt = stmt.on_conflict_do_nothing(index_elements=["order_number"])
    result = await self.db.execute(stmt)
    await self.db.commit()
    return result.rowcount
```

### 筛选与分页

```python
async def get_filtered(
    self, status: str | None = None, page: int = 1, page_size: int = 20
) -> tuple[list[Trade], int]:
    query = select(Trade)
    if status:
        query = query.where(Trade.status == status)

    # 统计总数
    count_query = select(func.count()).select_from(query.subquery())
    total = (await self.db.execute(count_query)).scalar() or 0

    # 分页
    query = query.order_by(Trade.open_time.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await self.db.execute(query)

    return list(result.scalars().all()), total
```

---

## 数据库迁移

### 命令

```bash
# 模型变更后创建迁移
alembic revision --autogenerate -m "描述性名称"

# 执行迁移
alembic upgrade head

# 回滚一步
alembic downgrade -1

# 查看当前迁移版本
alembic current
```

### 迁移命名

使用描述性的 kebab-case 命名：
- `add-trade-model`
- `add-order-number-unique-index`
- `add-user-settings`

### 规则

- 自动生成的迁移必须在执行前人工审查
- 已应用到生产环境的迁移禁止修改
- 用 `alembic upgrade head && alembic downgrade -1 && alembic upgrade head` 测试迁移

---

## 命名规范

| 类型 | 约定 | 示例 |
|------|------|------|
| 模型类 | PascalCase 单数 | `Trade`、`User` |
| 表名 | snake_case 复数（通过 `__tablename__`） | `trades`、`users` |
| 字段名 | snake_case | `entry_price`、`created_at` |
| 枚举类 | PascalCase | `TradeSide`、`TradeStatus` |
| 枚举值 | UPPER_SNAKE_CASE | `LONG`、`SHORT`、`OPEN`、`CLOSED` |
| 索引名 | `ix_{表名}_{字段名}` | `ix_trades_order_number` |
| 外键 | `{引用表}_id` | `user_id` |

### 模型示例

```python
# app/models/trade.py
import enum
from sqlalchemy import String, Float, Enum, Index
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin

class TradeSide(str, enum.Enum):
    LONG = "LONG"
    SHORT = "SHORT"

class TradeStatus(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"

class Trade(Base, TimestampMixin):
    __tablename__ = "trades"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_id)
    order_number: Mapped[str] = mapped_column(String, unique=True, index=True)
    symbol: Mapped[str] = mapped_column(String(20))
    side: Mapped[TradeSide] = mapped_column(Enum(TradeSide))
    status: Mapped[TradeStatus] = mapped_column(Enum(TradeStatus), default=TradeStatus.OPEN)
    entry_price: Mapped[float] = mapped_column(Float)
    exit_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    quantity: Mapped[float] = mapped_column(Float)
    pnl: Mapped[float | None] = mapped_column(Float, nullable=True)
    commission: Mapped[float | None] = mapped_column(Float, nullable=True)
    swap: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
```

---

## 常见错误

| 错误做法 | 正确做法 |
|---------|---------|
| 在异步 FastAPI 中使用同步 SQLAlchemy | 使用 `sqlalchemy.ext.asyncio` |
| 忘记 `await` 数据库操作 | 所有 DB 调用都需要 `await` |
| 未设置 `expire_on_commit=False` | 在 Session 工厂中设置，避免懒加载错误 |
| 在路由中手动创建 Session | 使用 `Depends(get_db)` 依赖注入 |
| ORM 支持的查询却用原生 SQL | 优先使用 SQLAlchemy 查询 API |
| 模型变更后忘记创建迁移 | 必须运行 `alembic revision` |
