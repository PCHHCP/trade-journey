import { parseISO } from "date-fns";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Panel, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { cn } from "@/lib/utils";
import type { TradeResponse } from "@/types/trade";
import { formatCurrency, formatLongDate } from "@/lib/locale";

interface TradeListPanelProps {
  trades: TradeResponse[];
}

export function TradeListPanel({ trades }: TradeListPanelProps) {
  const { t } = useTranslation();
  const { language, dateFnsLocale } = useAppLanguage();
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(b.open_time).getTime() - new Date(a.open_time).getTime(),
  );

  return (
    <Panel>
      <PanelHeader separated>
        <PanelTitle>{t("dashboard.table.recentTrades")}</PanelTitle>
      </PanelHeader>
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
              <th className="px-6 py-4 font-medium text-right">
                {t("dashboard.table.commission")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedTrades.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  {t("dashboard.table.empty")}
                </td>
              </tr>
            ) : (
              sortedTrades.map((trade) => {
                const tradeType = trade.type.toUpperCase().includes("BUY")
                  ? "LONG"
                  : "SHORT";
                return (
                  <tr
                    key={trade.id}
                    className="group transition-colors hover:bg-muted/40"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                      {formatLongDate(
                        parseISO(trade.open_time),
                        language,
                        dateFnsLocale,
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {trade.symbol}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                          tradeType === "LONG"
                            ? "bg-[var(--profit-soft)] text-[var(--profit)]"
                            : "bg-[var(--loss-soft)] text-[var(--loss)]",
                        )}
                      >
                        {tradeType === "LONG" ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {t(`dashboard.tradeTypes.${tradeType}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                      {formatCurrency(trade.open_price, language)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                      {formatCurrency(trade.close_price, language)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                      {trade.volume}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium">
                      <span
                        className={
                          trade.profit >= 0
                            ? "text-[var(--profit)]"
                            : "text-[var(--loss)]"
                        }
                      >
                        {trade.profit >= 0 ? "+" : ""}
                        {formatCurrency(trade.profit, language)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                      {formatCurrency(trade.commission, language)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
