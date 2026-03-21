import logging

from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.exceptions import ValidationException
from app.models.user import User
from app.schemas.trade import ImportResult, TradeListResponse, TradeResponse
from app.schemas.trading_account import TradingAccountResponse
from app.services.trade import TradeService
from app.services.trading_account import TradingAccountService
from app.services.xlsx_parser import parse_trade_report

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/trades", tags=["trades"])


@router.post("/import", response_model=ImportResult)
async def import_trades(
    file: UploadFile,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ImportResult:
    if not file.filename or not file.filename.endswith(".xlsx"):
        raise ValidationException("File must be an XLSX file")

    content = await file.read()
    if not content:
        raise ValidationException("Uploaded file is empty")

    report = parse_trade_report(content)

    account_service = TradingAccountService(db)
    account = await account_service.get_or_create(
        user_id=current_user.id,
        account_name=report.account_name,
        account_number=report.account_number,
        platform=report.platform,
        company=report.company,
    )

    trade_service = TradeService(db)
    imported, skipped = await trade_service.import_trades(
        user_id=current_user.id,
        account_id=account.id,
        trades_data=report.trades,
    )

    logger.info(
        "Trade import completed",
        extra={
            "user_id": current_user.id,
            "account_id": account.id,
            "imported": imported,
            "skipped": skipped,
        },
    )

    return ImportResult(
        imported=imported,
        skipped=skipped,
        account=TradingAccountResponse.model_validate(account),
    )


@router.get("", response_model=TradeListResponse)
async def list_trades(
    account_id: str | None = None,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TradeListResponse:
    service = TradeService(db)
    trades, total = await service.list_trades(
        user_id=current_user.id,
        account_id=account_id,
        limit=limit,
        offset=offset,
    )
    return TradeListResponse(
        trades=[TradeResponse.model_validate(t) for t in trades],
        total=total,
    )


@router.get("/accounts", response_model=list[TradingAccountResponse])
async def list_trading_accounts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[TradingAccountResponse]:
    service = TradingAccountService(db)
    accounts = await service.list_by_user(current_user.id)
    return [TradingAccountResponse.model_validate(a) for a in accounts]
