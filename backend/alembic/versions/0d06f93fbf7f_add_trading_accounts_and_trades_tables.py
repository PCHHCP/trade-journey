"""add trading_accounts and trades tables

Revision ID: 0d06f93fbf7f
Revises: 5731835def03
Create Date: 2026-03-22 00:36:06.081640

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0d06f93fbf7f"
down_revision: str | Sequence[str] | None = "5731835def03"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_now = sa.text("now()")


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "trades",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("account_id", sa.String(), nullable=False),
        sa.Column("ticket", sa.BigInteger(), nullable=False),
        sa.Column("symbol", sa.String(), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("volume", sa.Numeric(), nullable=False),
        sa.Column("open_price", sa.Numeric(), nullable=False),
        sa.Column("stop_loss", sa.Numeric(), nullable=True),
        sa.Column("take_profit", sa.Numeric(), nullable=True),
        sa.Column("open_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("close_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("close_price", sa.Numeric(), nullable=False),
        sa.Column("commission", sa.Numeric(), nullable=False),
        sa.Column("swap", sa.Numeric(), nullable=False),
        sa.Column("profit", sa.Numeric(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=_now, nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=_now, nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("account_id", "ticket", name="uq_account_ticket"),
    )
    op.create_index(op.f("ix_trades_account_id"), "trades", ["account_id"], unique=False)
    op.create_index(op.f("ix_trades_user_id"), "trades", ["user_id"], unique=False)
    op.create_table(
        "trading_accounts",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("account_name", sa.String(), nullable=False),
        sa.Column("account_number", sa.String(), nullable=False),
        sa.Column("platform", sa.String(), nullable=False),
        sa.Column("company", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=_now, nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=_now, nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "account_number", name="uq_user_account_number"),
    )
    op.create_index(
        op.f("ix_trading_accounts_user_id"),
        "trading_accounts",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_trading_accounts_user_id"), table_name="trading_accounts")
    op.drop_table("trading_accounts")
    op.drop_index(op.f("ix_trades_user_id"), table_name="trades")
    op.drop_index(op.f("ix_trades_account_id"), table_name="trades")
    op.drop_table("trades")
