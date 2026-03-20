import { useMemo } from "react";
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
} from "recharts";
import { format, parseISO } from "date-fns";
import type { DashboardTrade } from "./types";
import { formatCurrency } from "./utils";

interface DashboardChartsProps {
  trades: DashboardTrade[];
}

export function DashboardCharts({ trades }: DashboardChartsProps) {
  const sortedTrades = useMemo(() => {
    return [...trades].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [trades]);

  const cumulativeData = useMemo(() => {
    return sortedTrades.reduce<{ date: string; pnl: number }[]>((acc, t) => {
      const prev = acc.length > 0 ? acc[acc.length - 1].pnl : 0;
      acc.push({
        date: format(parseISO(t.date), "MMM dd"),
        pnl: prev + t.pnl,
      });
      return acc;
    }, []);
  }, [sortedTrades]);

  const dailyData = useMemo(() => {
    const dailyMap = new Map<string, number>();
    sortedTrades.forEach((t) => {
      const dateStr = format(parseISO(t.date), "MMM dd");
      dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + t.pnl);
    });
    return Array.from(dailyMap.entries()).map(([date, pnl]) => ({ date, pnl }));
  }, [sortedTrades]);

  const winLossData = useMemo(() => {
    const wins = trades.filter((t) => t.pnl > 0).length;
    const losses = trades.filter((t) => t.pnl <= 0).length;
    return [
      { name: "Wins", value: wins, color: "#10b981" },
      { name: "Losses", value: losses, color: "#f43f5e" },
    ];
  }, [trades]);

  const tooltipStyle = {
    backgroundColor: "#1e1f23",
    borderColor: "#2d2e33",
    color: "#f8fafc",
    borderRadius: "8px",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.5)",
  };
  const tooltipItemStyle = { color: "#f8fafc" };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Cumulative PnL Chart */}
      <div className="lg:col-span-2 bg-[#1e1f23] p-6 rounded-2xl border border-white/5">
        <h3 className="text-base font-semibold text-white mb-6">
          Cumulative P&L
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={cumulativeData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#2d2e33"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickFormatter={(val: number) => `$${val}`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={tooltipItemStyle}
                formatter={(value) => [
                  formatCurrency(value as number),
                  "Cumulative P&L",
                ]}
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
      </div>

      {/* Win/Loss Pie Chart */}
      <div className="bg-[#1e1f23] p-6 rounded-2xl border border-white/5 flex flex-col">
        <h3 className="text-base font-semibold text-white mb-6">
          Win / Loss Ratio
        </h3>
        <div className="flex-1 min-h-[250px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={winLossData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {winLossData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={tooltipItemStyle}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
            <span className="text-2xl font-bold text-white">
              {trades.length > 0
                ? Math.round((winLossData[0].value / trades.length) * 100)
                : 0}
              %
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-wider">
              Win Rate
            </span>
          </div>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          {winLossData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-slate-300">
                {item.name} ({item.value})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily PnL Bar Chart */}
      <div className="lg:col-span-3 bg-[#1e1f23] p-6 rounded-2xl border border-white/5">
        <h3 className="text-base font-semibold text-white mb-6">Daily P&L</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dailyData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#2d2e33"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickFormatter={(val: number) => `$${val}`}
              />
              <Tooltip
                cursor={{ fill: "#2d2e33" }}
                contentStyle={tooltipStyle}
                itemStyle={tooltipItemStyle}
                formatter={(value) => [
                  formatCurrency(value as number),
                  "Daily P&L",
                ]}
              />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {dailyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.pnl >= 0 ? "#10b981" : "#f43f5e"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
