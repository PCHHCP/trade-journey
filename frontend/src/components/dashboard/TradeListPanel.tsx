import { parseISO } from "date-fns";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { cn } from "@/lib/utils";
import type { DashboardTrade } from "./types";
import { formatCurrency, formatLongDate } from "@/lib/locale";

interface TradeListPanelProps {
  trades: DashboardTrade[];
  onDelete?: (id: string) => void;
}

export function TradeListPanel({ trades, onDelete }: TradeListPanelProps) {
  const { t } = useTranslation();
  const { language, dateFnsLocale } = useAppLanguage();
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border p-6">
        <h3 className="text-base font-semibold text-foreground">
          {t("dashboard.table.recentTrades")}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-medium">
                {t("dashboard.table.date")}
              </th>
              <th className="px-6 py-4 font-medium">
                {t("dashboard.table.product")}
              </th>
              <th className="px-6 py-4 font-medium">
                {t("dashboard.table.type")}
              </th>
              <th className="px-6 py-4 font-medium text-right">
                {t("dashboard.table.entry")}
              </th>
              <th className="px-6 py-4 font-medium text-right">
                {t("dashboard.table.exit")}
              </th>
              <th className="px-6 py-4 font-medium text-right">
                {t("dashboard.table.lot")}
              </th>
              <th className="px-6 py-4 font-medium text-right">
                {t("dashboard.table.pnl")}
              </th>
              <th className="px-6 py-4 font-medium">
                {t("dashboard.table.notes")}
              </th>
              <th className="px-6 py-4 font-medium text-right">
                {t("dashboard.table.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedTrades.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  {t("dashboard.table.empty")}
                </td>
              </tr>
            ) : (
              sortedTrades.map((trade) => (
                <tr
                  key={trade.id}
                  className="group transition-colors hover:bg-muted/40"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                    {formatLongDate(
                      parseISO(trade.date),
                      language,
                      dateFnsLocale,
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    {trade.product}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                        trade.type === "LONG"
                          ? "bg-[var(--profit-soft)] text-[var(--profit)]"
                          : "bg-[var(--loss-soft)] text-[var(--loss)]",
                      )}
                    >
                      {trade.type === "LONG" ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {t(`dashboard.tradeTypes.${trade.type}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                    {formatCurrency(trade.entryPrice, language)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                    {formatCurrency(trade.exitPrice, language)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                    {trade.lot}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-medium">
                    <span
                      className={
                        trade.pnl >= 0 ? "text-[var(--profit)]" : "text-[var(--loss)]"
                      }
                    >
                      {trade.pnl >= 0 ? "+" : ""}
                      {formatCurrency(trade.pnl, language)}
                    </span>
                  </td>
                  <td
                    className="max-w-[200px] truncate px-6 py-4 text-muted-foreground"
                    title={trade.notes}
                  >
                    {trade.notes || "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onDelete?.(trade.id)}
                      className="opacity-0 text-muted-foreground transition-colors group-hover:opacity-100 hover:text-[var(--loss)]"
                      aria-label={t("dashboard.table.deleteTradeAria")}
                    >
                      {t("dashboard.actions.deleteTrade")}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
