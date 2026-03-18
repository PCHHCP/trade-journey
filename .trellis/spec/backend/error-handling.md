# 后端错误处理

> 错误处理的方式和约定。

---

## 概述

错误通过 FastAPI 的异常处理器系统统一管理。业务逻辑抛出自定义异常，FastAPI 通过注册的异常处理器将其转换为规范的 HTTP 响应。

---

## 错误类型

在 `app/exceptions.py` 中定义自定义异常类：

```python
# app/exceptions.py
from fastapi import HTTPException

class AppException(HTTPException):
    """应用基础异常类。"""
    def __init__(self, status_code: int, detail: str, code: str = "APP_ERROR"):
        super().__init__(status_code=status_code, detail=detail)
        self.code = code

class NotFoundException(AppException):
    def __init__(self, resource: str, id: str | None = None):
        detail = f"{resource} with id {id} not found" if id else f"{resource} not found"
        super().__init__(status_code=404, detail=detail, code="NOT_FOUND")

class ValidationException(AppException):
    def __init__(self, detail: str):
        super().__init__(status_code=400, detail=detail, code="VALIDATION_ERROR")

class DuplicateException(AppException):
    def __init__(self, resource: str, field: str):
        super().__init__(
            status_code=409,
            detail=f"{resource} with this {field} already exists",
            code="DUPLICATE",
        )

class UnauthorizedException(AppException):
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(status_code=401, detail=detail, code="UNAUTHORIZED")
```

---

## 错误处理模式

### 在 Service 层中

Service 抛出异常，Router 不需要 try/except：

```python
# app/services/trade.py
from app.exceptions import NotFoundException

class TradeService:
    async def get_by_id(self, trade_id: str) -> Trade:
        trade = await self.db.get(Trade, trade_id)
        if not trade:
            raise NotFoundException("Trade", trade_id)
        return trade
```

### 在 Router 层中

保持路由精简——让异常自动传播到 FastAPI 处理器：

```python
# app/routers/trades.py
@router.get("/{trade_id}", response_model=TradeResponse)
async def get_trade(trade_id: str, db: AsyncSession = Depends(get_db)):
    service = TradeService(db)
    return await service.get_by_id(trade_id)  # 找不到时自动抛出 NotFoundException
```

### 全局异常处理器

在 `main.py` 中注册自定义处理器：

```python
# main.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.exceptions import AppException

app = FastAPI()

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "message": exc.detail,
                "code": exc.code,
            }
        },
    )
```

---

## API 错误响应格式

### 标准格式

```json
{
  "error": {
    "message": "人类可读的错误信息",
    "code": "机器可读的错误码"
  }
}
```

### Pydantic 校验错误（自动返回）

FastAPI 对 Pydantic 校验失败自动返回 422：

```json
{
  "detail": [
    {
      "loc": ["body", "symbol"],
      "msg": "Field required",
      "type": "missing"
    }
  ]
}
```

### HTTP 状态码参考

| 状态码 | 用途 |
|--------|------|
| 400 | 请求格式错误、业务校验失败 |
| 401 | 未认证 |
| 403 | 无权限（已认证但无操作权限） |
| 404 | 资源不存在 |
| 409 | 冲突（如订单号重复） |
| 422 | Pydantic 校验错误（自动） |
| 500 | 未预期的服务端错误 |

---

## 常见错误

| 错误做法 | 正确做法 |
|---------|---------|
| 返回 200 + body 中包含错误信息 | 使用正确的 HTTP 状态码 |
| 使用通用 `Exception` | 使用自定义异常类 |
| 每个 Router 都写 try/except | 让异常传播到全局处理器 |
| 生产环境暴露堆栈信息 | 500 错误返回通用信息 |
| 静默捕获异常 | 始终记录未预期的错误 |
