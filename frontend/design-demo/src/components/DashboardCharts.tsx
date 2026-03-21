import { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Trade } from '../types';
import { formatCurrency } from '../lib/utils';
import { format, parseISO } from 'date-fns';

interface DashboardChartsProps {
  trades: Trade[];
}

export function DashboardCharts({ trades }: DashboardChartsProps) {
  // Sort trades by date
  const sortedTrades = useMemo(() => {
    return [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [trades]);

  // Cumulative PnL Data
  const cumulativeData = useMemo(() => {
    let cumulative = 0;
    return sortedTrades.map((t) => {
      cumulative += t.pnl;
      return {
        date: format(parseISO(t.date), 'MMM dd'),
        pnl: cumulative,
      };
    });
  }, [sortedTrades]);

  // Daily PnL Data
  const dailyData = useMemo(() => {
    const dailyMap = new Map<string, number>();
    sortedTrades.forEach((t) => {
      const dateStr = format(parseISO(t.date), 'MMM dd');
      dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + t.pnl);
    });
    return Array.from(dailyMap.entries()).map(([date, pnl]) => ({ date, pnl }));
  }, [sortedTrades]);

  // Long/Short Ratio Data
  const typeData = useMemo(() => {
    const longs = trades.filter((t) => t.type === 'LONG').length;
    const shorts = trades.filter((t) => t.type === 'SHORT').length;
    return [
      { name: 'Long', value: longs, color: '#6366f1' }, // indigo-500
      { name: 'Short', value: shorts, color: '#a855f7' }, // purple-500
    ];
  }, [trades]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Cumulative PnL Chart */}
      <motion.div 
        whileHover={{ y: -4 }}
        className="lg:col-span-2 bg-[var(--bg-secondary)] p-6 rounded-3xl border border-[var(--border-color)] shadow-sm transition-shadow hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
      >
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-6">Cumulative P&L</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cumulativeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-color)', 
                  color: 'var(--text-primary)', 
                  borderRadius: '12px', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  border: '1px solid var(--border-color)'
                }}
                itemStyle={{ color: 'var(--text-primary)' }}
                formatter={(value: number) => [formatCurrency(value), 'Cumulative P&L']}
              />
              <Area 
                type="monotone" 
                dataKey="pnl" 
                stroke="#6366f1" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPnl)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Long/Short Pie Chart */}
      <motion.div 
        whileHover={{ y: -4 }}
        className="bg-[var(--bg-secondary)] p-6 rounded-3xl border border-[var(--border-color)] flex flex-col shadow-sm transition-shadow hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
      >
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-6">Trade Distribution</h3>
        <div className="flex-1 min-h-[250px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-color)', 
                  color: 'var(--text-primary)', 
                  borderRadius: '12px', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  border: '1px solid var(--border-color)'
                }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
            <span className="text-2xl font-bold text-[var(--text-primary)]">
              {trades.length > 0 ? Math.round((typeData[0].value / trades.length) * 100) : 0}%
            </span>
            <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Longs</span>
          </div>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          {typeData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-[var(--text-secondary)]">{item.name} ({item.value})</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Daily PnL Bar Chart */}
      <motion.div 
        whileHover={{ y: -4 }}
        className="lg:col-span-3 bg-[var(--bg-secondary)] p-6 rounded-3xl border border-[var(--border-color)] shadow-sm transition-shadow hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
      >
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-6">Daily P&L</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip 
                cursor={{ fill: 'var(--bg-tertiary)', opacity: 0.4 }}
                contentStyle={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-color)', 
                  color: 'var(--text-primary)', 
                  borderRadius: '12px', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  border: '1px solid var(--border-color)'
                }}
                itemStyle={{ color: 'var(--text-primary)' }}
                formatter={(value: number) => [formatCurrency(value), 'Daily P&L']}
              />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {dailyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#f43f5e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
