import { Trade } from '../types';
import { motion } from 'motion/react';
import { formatCurrency, cn } from '../lib/utils';
import { format, parseISO } from 'date-fns';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TradeListProps {
  trades: Trade[];
  onDelete?: (id: string) => void;
}

export function TradeList({ trades, onDelete }: TradeListProps) {
  const sortedTrades = [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm">
      <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">Recent Trades</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-[var(--text-secondary)] uppercase bg-[var(--bg-tertiary)]/50 border-b border-[var(--border-color)]">
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
          <motion.tbody 
            className="divide-y divide-[var(--border-color)]"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
          >
            {sortedTrades.length === 0 ? (
              <motion.tr variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <td colSpan={9} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                  No trades recorded yet. Add your first trade to see it here.
                </td>
              </motion.tr>
            ) : (
              sortedTrades.map((trade) => (
                <motion.tr 
                  key={trade.id} 
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                  className="hover:bg-[var(--bg-tertiary)]/50 transition-colors group"
                >
                  <td className="px-6 py-4 text-[var(--text-secondary)] whitespace-nowrap">
                    {format(parseISO(trade.date), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 font-medium text-[var(--text-primary)]">
                    {trade.asset}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                      trade.type === 'LONG' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    )}>
                      {trade.type === 'LONG' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {trade.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-[var(--text-secondary)]">
                    {formatCurrency(trade.entryPrice)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-[var(--text-secondary)]">
                    {formatCurrency(trade.exitPrice)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-[var(--text-secondary)]">
                    {Math.round(trade.quantity * 100) / 100}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-medium">
                    <span className={trade.pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                      {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)] max-w-[200px] truncate" title={trade.notes}>
                    {trade.notes || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onDelete?.(trade.id)}
                      className="text-[var(--text-secondary)] hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Delete trade"
                    >
                      Delete
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
