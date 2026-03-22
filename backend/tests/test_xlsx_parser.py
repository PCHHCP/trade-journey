from datetime import UTC, datetime
from io import BytesIO

from openpyxl import Workbook

from app.services.xlsx_parser import parse_trade_report


def _workbook_bytes(rows: list[list[object]]) -> bytes:
    workbook = Workbook()
    worksheet = workbook.active
    assert worksheet is not None

    for row in rows:
        worksheet.append(row)

    buffer = BytesIO()
    workbook.save(buffer)
    workbook.close()
    return buffer.getvalue()


def test_parse_trade_report_handles_separate_section_title_row() -> None:
    file_content = _workbook_bytes(
        [
            ["名称: Bybit421782086"],
            ["账户: 2086467 (UST, Bybit-Live, real, Hedge)"],
            ["公司: Infra Capital Limited"],
            [],
            ["持仓"],
            [
                "时间",
                "持仓",
                "交易品种",
                "类型",
                "交易量",
                "价位",
                "止损",
                "止盈",
                "时间",
                "价位",
                "手续费",
                "库存费",
                "盈利",
            ],
            [
                "2026.03.06 12:48:59",
                123456,
                "XAUUSD.s",
                "buy",
                "0.10",
                "2900.50",
                "0",
                "0",
                "2026.03.06 13:48:59",
                "2910.00",
                "-1.25",
                "0.00",
                "94.50",
            ],
            ["订单"],
        ]
    )

    report = parse_trade_report(file_content)

    assert report.account_name == "Bybit421782086"
    assert report.account_number == "2086467"
    assert report.platform == "UST, Bybit-Live, real, Hedge"
    assert report.company == "Infra Capital Limited"
    assert len(report.trades) == 1
    assert report.trades[0]["ticket"] == 123456
    assert report.trades[0]["symbol"] == "XAUUSD.s"
    assert report.trades[0]["type"] == "buy"
    assert report.trades[0]["open_time"] == datetime(2026, 3, 6, 12, 48, 59, tzinfo=UTC)
    assert report.trades[0]["close_time"] == datetime(2026, 3, 6, 13, 48, 59, tzinfo=UTC)


def test_parse_trade_report_handles_split_metadata_and_english_headers() -> None:
    file_content = _workbook_bytes(
        [
            ["Name", "Bybit421782086"],
            ["Account", "2086467", "(UST, Bybit-Live, real, Hedge)"],
            ["Company", "Infra Capital Limited"],
            [],
            ["Positions"],
            [
                "Time",
                "Position",
                "Symbol",
                "Type",
                "Volume",
                "Price",
                "S/L",
                "T/P",
                "Time",
                "Price",
                "Commission",
                "Swap",
                "Profit",
            ],
            [
                "2026.03.06 12:48:59",
                654321,
                "BTCUSD",
                "sell",
                "0.02",
                "65000",
                "",
                "",
                "2026.03.06 14:00:00",
                "64500",
                "-2.50",
                "0",
                "97.5",
            ],
            ["Orders"],
        ]
    )

    report = parse_trade_report(file_content)

    assert report.account_name == "Bybit421782086"
    assert report.account_number == "2086467"
    assert report.platform == "UST, Bybit-Live, real, Hedge"
    assert report.company == "Infra Capital Limited"
    assert len(report.trades) == 1
    assert report.trades[0]["ticket"] == 654321
    assert report.trades[0]["symbol"] == "BTCUSD"
    assert report.trades[0]["type"] == "sell"
