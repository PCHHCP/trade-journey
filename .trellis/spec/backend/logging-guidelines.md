# 后端日志规范

> 日志记录的方式和约定。

---

## 概述

日志使用 Python 内置的 `logging` 模块，输出结构化日志。每个模块创建独立的 logger 实例。

---

## Logger 设置

```python
# 在每个模块中
import logging

logger = logging.getLogger(__name__)

# 使用示例
logger.info("Trade created", extra={"trade_id": trade.id, "symbol": trade.symbol})
logger.error("Failed to parse MT5 file", extra={"filename": file.filename}, exc_info=True)
```

### 应用级配置

```python
# app/config.py 或 main.py
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
```

---

## 日志级别

| 级别 | 使用场景 | 示例 |
|------|---------|------|
| `ERROR` | 未预期的错误、操作失败 | 数据库连接失败、未处理的异常 |
| `WARNING` | 可恢复的问题、弃用警告 | 缺少可选配置、慢查询 |
| `INFO` | 重要的业务事件 | 交易创建、MT5 文件导入、用户登录 |
| `DEBUG` | 详细的诊断信息（仅开发环境） | 查询参数、解析后的文件内容 |

---

## 结构化日志

每条日志必须包含上下文信息：

```python
# 正确：带上下文的结构化日志
logger.info("Trade imported", extra={
    "order_number": trade.order_number,
    "symbol": trade.symbol,
    "source": "mt5",
})

# 正确：错误日志带上下文
logger.error("MT5 parse failed", extra={
    "filename": file.filename,
    "line": line_number,
}, exc_info=True)

# 错误：非结构化日志
print("trade imported")
logger.info(f"imported {trade}")
```

---

## 需要记录的内容

- API 请求错误（4xx 和 5xx）
- 数据库错误和慢查询
- 认证事件（登录、登出、失败的尝试）
- 关键业务操作（交易导入、批量操作）
- MT5 文件解析结果（成功数、失败数、跳过的重复项）
- 应用启动和配置加载

---

## 禁止记录的内容

| 禁止记录 | 原因 |
|---------|------|
| 密码 / Token | 安全风险 |
| 完整的用户凭证 | 隐私保护 |
| `print()` 语句 | 应使用 `logging` 模块 |
| 健康检查成功日志 | 日志噪音 |
| 生产环境的完整请求/响应体 | 性能与安全 |
| 大批量的敏感交易数据 | 隐私和日志体积 |
