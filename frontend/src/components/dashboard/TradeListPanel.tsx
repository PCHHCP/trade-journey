import { format, parseISO } from "date-fns";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardTrade } from "./types";
import { formatCurrency } from "./utils";

interface TradeListPanelProps {
  trades: DashboardTrade[];
  onDelete?: (id: string) => void;
}

export function TradeListPanel({ trades, onDelete }: TradeListPanelProps) {
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="bg-[#1e1f23] rounded-2xl border border-white/5 overflow-hidden">
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <h3 className="text-base font-semibold text-white">Recent Trades</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-[#16171a]/50 border-b border-white/5">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium text-right">Entry</th>
              <th className="px-6 py-4 font-medium text-right">Exit</th>
              <th className="px-6 py-4 font-medium text-right">Lot</th>
              <th className="px-6 py-4 font-medium text-right">P&L</th>
              <th className="px-6 py-4 font-medium">Notes</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedTrades.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-8 text-center text-slate-400"
                >
                  No trades recorded yet. Add your first trade to see it here.
                </td>
              </tr>
            ) : (
              sortedTrades.map((trade) => (
                <tr
                  key={trade.id}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-6 py-4 text-slate-300 whitespace-nowrap">
                    {format(parseISO(trade.date), "MMM dd, yyyy")}
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    {trade.product}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                        trade.type === "LONG"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-rose-500/10 text-rose-400",
                      )}
                    >
                      {trade.type === "LONG" ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {trade.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-300">
                    {formatCurrency(trade.entryPrice)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-300">
                    {formatCurrency(trade.exitPrice)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-300">
                    {trade.lot}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-medium">
                    <span
                      className={
                        trade.pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                      }
                    >
                      {trade.pnl >= 0 ? "+" : ""}
                      {formatCurrency(trade.pnl)}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 text-slate-400 max-w-[200px] truncate"
                    title={trade.notes}
                  >
                    {trade.notes || "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onDelete?.(trade.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Delete trade"
                    >
                      Delete
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
