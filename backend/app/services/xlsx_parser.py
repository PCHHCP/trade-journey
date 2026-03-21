import logging
import re
from dataclasses import dataclass, field
from datetime import UTC, datetime
from decimal import Decimal, InvalidOperation
from io import BytesIO

from openpyxl import load_workbook
from openpyxl.cell.cell import Cell
from openpyxl.worksheet.worksheet import Worksheet

from app.exceptions import ValidationException

logger = logging.getLogger(__name__)


@dataclass
class ParsedReport:
    account_name: str
    account_number: str
    platform: str
    company: str | None
    trades: list[dict[str, object]] = field(default_factory=list)


def _parse_number(value: object) -> Decimal | None:
    """Parse a number that may contain spaces as thousands separators."""
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return Decimal(str(value))
    text = str(value).strip()
    if not text:
        return None
    # Remove spaces used as thousands separators
    text = text.replace(" ", "").replace("\u00a0", "")
    try:
        return Decimal(text)
    except InvalidOperation:
        return None


def _parse_datetime(value: object) -> datetime | None:
    """Parse datetime from MT5 report format: '2026.03.06 12:48:59'."""
    if value is None:
        return None
    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(tzinfo=UTC)
        return value
    text = str(value).strip()
    if not text:
        return None
    try:
        dt = datetime.strptime(text, "%Y.%m.%d %H:%M:%S")
        return dt.replace(tzinfo=UTC)
    except ValueError:
        return None


def _cell_text(cell: Cell) -> str:
    """Get cell value as stripped text."""
    if cell.value is None:
        return ""
    return str(cell.value).strip()


def _extract_metadata(ws: Worksheet) -> tuple[str, str, str, str | None]:
    """Extract account metadata from the top rows of the report.

    Returns (account_name, account_number, platform, company).
    """
    account_name = ""
    account_number = ""
    platform = ""
    company: str | None = None

    for row in ws.iter_rows(min_row=1, max_row=20, max_col=10):
        for cell in row:
            text = _cell_text(cell)
            if not text:
                continue

            if "名称:" in text or "名称：" in text:
                # e.g., "名称: Bybit421782086"
                account_name = re.sub(r"名称[:：]\s*", "", text)

            elif "账户:" in text or "账户：" in text:
                # e.g., "账户: 2086467 (UST, Bybit-Live, real, Hedge)"
                cleaned = re.sub(r"账户[:：]\s*", "", text)
                match = re.match(r"(\d+)\s*\((.+)\)", cleaned)
                if match:
                    account_number = match.group(1)
                    platform = match.group(2).strip()
                else:
                    account_number = cleaned

            elif "公司:" in text or "公司：" in text:
                # e.g., "公司: Infra Capital Limited"
                company = re.sub(r"公司[:：]\s*", "", text)
                if not company:
                    company = None

    if not account_name or not account_number:
        raise ValidationException("Cannot extract account metadata from XLSX report")

    return account_name, account_number, platform, company


def _find_positions_section(ws: Worksheet) -> int | None:
    """Find the row number of the 持仓 (positions) header row."""
    for row in ws.iter_rows(min_row=1):
        texts = [_cell_text(c) for c in row]
        # The header row contains "持仓" as well as column headers like "时间" and "交易品种"
        if "持仓" in texts or any("持仓" in t for t in texts):
            # Check if this is the actual column header row (has "时间" and "交易品种")
            if any("时间" in t for t in texts) and any("交易品种" in t for t in texts):
                return int(row[0].row)
    return None


def _map_header_columns(header_row: tuple[Cell, ...]) -> dict[str, int]:
    """Map Chinese header names to column indices."""
    mapping: dict[str, int] = {}
    price_count = 0

    for i, cell in enumerate(header_row):
        text = _cell_text(cell)
        if text == "时间":
            # First "时间" is open_time, second is close_time
            if "open_time" not in mapping:
                mapping["open_time"] = i
            else:
                mapping["close_time"] = i
        elif text == "持仓":
            mapping["ticket"] = i
        elif text == "交易品种":
            mapping["symbol"] = i
        elif text == "类型":
            mapping["type"] = i
        elif text in ("交易量", "手数"):
            mapping["volume"] = i
        elif text == "价位":
            # First "价位" is open_price, second is close_price
            if price_count == 0:
                mapping["open_price"] = i
            else:
                mapping["close_price"] = i
            price_count += 1
        elif text == "止损":
            mapping["stop_loss"] = i
        elif text == "止盈":
            mapping["take_profit"] = i
        elif text == "盈利":
            mapping["profit"] = i
        elif text == "手续费":
            mapping["commission"] = i
        elif text == "库存费":
            mapping["swap"] = i

    return mapping


def _parse_trade_type(value: object) -> str:
    """Parse trade type from MT5 format."""
    text = str(value).strip().lower() if value else ""
    if "buy" in text:
        return "buy"
    if "sell" in text:
        return "sell"
    return text


def parse_trade_report(file_content: bytes) -> ParsedReport:
    """Parse an MT5 XLSX trade history report.

    Extracts account metadata and the 持仓 (positions/deals) section.
    """
    try:
        wb = load_workbook(filename=BytesIO(file_content), read_only=True, data_only=True)
    except Exception as e:
        raise ValidationException(f"Cannot read XLSX file: {e}")

    ws = wb.active
    if ws is None:
        raise ValidationException("XLSX file has no active worksheet")

    account_name, account_number, platform, company = _extract_metadata(ws)

    header_row_num = _find_positions_section(ws)
    if header_row_num is None:
        raise ValidationException("Cannot find 持仓 (positions) section in report")

    # Get header row to map columns
    header_cells: tuple[Cell, ...] | None = None
    for row in ws.iter_rows(min_row=header_row_num, max_row=header_row_num):
        header_cells = row
        break

    if header_cells is None:
        raise ValidationException("Cannot read header row")

    col_map = _map_header_columns(header_cells)

    required_cols = ["ticket", "symbol", "type", "volume", "open_price", "open_time"]
    missing = [c for c in required_cols if c not in col_map]
    if missing:
        raise ValidationException(f"Missing required columns: {', '.join(missing)}")

    trades: list[dict[str, object]] = []

    for row in ws.iter_rows(min_row=header_row_num + 1):
        cells = row

        # Stop at next section header ("订单") or empty rows
        first_text = _cell_text(cells[0]) if cells else ""
        if "订单" in first_text:
            break

        # Check if the ticket column has a value (skip empty/summary rows)
        ticket_val = cells[col_map["ticket"]].value if "ticket" in col_map else None
        if ticket_val is None:
            continue

        try:
            ticket_num = int(ticket_val)
        except (ValueError, TypeError):
            continue

        def _get_num(
            key: str,
            default: Decimal | None = None,
        ) -> Decimal | None:
            if key not in col_map:
                return default
            return _parse_number(cells[col_map[key]].value) or default

        def _get_dt(key: str) -> datetime | None:
            if key not in col_map:
                return None
            return _parse_datetime(cells[col_map[key]].value)

        open_time = _get_dt("open_time")
        close_time = _get_dt("close_time")

        if open_time is None or close_time is None:
            continue

        trade_data: dict[str, object] = {
            "ticket": ticket_num,
            "symbol": str(cells[col_map["symbol"]].value or "").strip(),
            "type": _parse_trade_type(cells[col_map["type"]].value),
            "volume": _get_num("volume", Decimal("0")),
            "open_price": _get_num("open_price", Decimal("0")),
            "stop_loss": _get_num("stop_loss"),
            "take_profit": _get_num("take_profit"),
            "open_time": open_time,
            "close_time": close_time,
            "close_price": _get_num("close_price", Decimal("0")),
            "commission": _get_num("commission", Decimal("0")),
            "swap": _get_num("swap", Decimal("0")),
            "profit": _get_num("profit", Decimal("0")),
        }

        trades.append(trade_data)

    wb.close()

    logger.info(
        "Parsed XLSX report",
        extra={"account_number": account_number, "trade_count": len(trades)},
    )

    return ParsedReport(
        account_name=account_name,
        account_number=account_number,
        platform=platform,
        company=company,
        trades=trades,
    )
