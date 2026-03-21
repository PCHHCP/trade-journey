import { useState, useMemo } from "react";
import {
  subDays,
  startOfMonth,
  startOfYear,
  parseISO,
  startOfDay,
  endOfDay,
} from "date-fns";
import {
  Activity,
  TrendingUp,
  Target,
  Plus,
  LineChart,
  Wallet,
  Filter,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useTheme } from "@/hooks/useTheme";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { TradeListPanel } from "@/components/dashboard/TradeListPanel";
import { TradeForm } from "@/components/dashboard/TradeForm";
import { initialTrades } from "@/components/dashboard/mockData";
import { formatCurrency, formatPercentage } from "@/components/dashboard/utils";
import type { DashboardTrade, TradeStats } from "@/components/dashboard/types";

export function Dashboard() {
  const { resolvedTheme } = useTheme();
  const [trades, setTrades] = useState<DashboardTrade[]>(initialTrades);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  const filteredTrades = useMemo(() => {
    const now = new Date();
    return trades.filter((trade) => {
      const tradeDate = parseISO(trade.date);
      if (dateFilter === "7d") return tradeDate >= startOfDay(subDays(now, 7));
      if (dateFilter === "30d")
        return tradeDate >= startOfDay(subDays(now, 30));
      if (dateFilter === "month") return tradeDate >= startOfMonth(now);
      if (dateFilter === "year") return tradeDate >= startOfYear(now);
      if (dateFilter === "custom") {
        const start = customStartDate
          ? startOfDay(parseISO(customStartDate))
          : new Date(0);
        const end = customEndDate
          ? endOfDay(parseISO(customEndDate))
          : new Date(8640000000000000);
        return tradeDate >= start && tradeDate <= end;
      }
      return true;
    });
  }, [trades, dateFilter, customStartDate, customEndDate]);

  const stats = useMemo<TradeStats>(() => {
    if (filteredTrades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        totalPnl: 0,
        profitFactor: 0,
        averageWin: 0,
        averageLoss: 0,
        largestWin: 0,
        largestLoss: 0,
      };
    }

    const wins = filteredTrades.filter((t) => t.pnl > 0);
    const losses = filteredTrades.filter((t) => t.pnl <= 0);

    const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
    const totalPnl = grossProfit - grossLoss;

    const winRate = (wins.length / filteredTrades.length) * 100;
    const profitFactor =
      grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

    const averageWin = wins.length > 0 ? grossProfit / wins.length : 0;
    const averageLoss = losses.length > 0 ? grossLoss / losses.length : 0;

    const largestWin =
      wins.length > 0 ? Math.max(...wins.map((t) => t.pnl)) : 0;
    const largestLoss =
      losses.length > 0 ? Math.min(...losses.map((t) => t.pnl)) : 0;

    return {
      totalTrades: filteredTrades.length,
      winRate,
      totalPnl,
      profitFactor,
      averageWin,
      averageLoss,
      largestWin,
      largestLoss,
    };
  }, [filteredTrades]);

  const handleAddTrade = (newTrade: Omit<DashboardTrade, "id">) => {
    const trade: DashboardTrade = {
      ...newTrade,
      id: Math.random().toString(36).substring(2, 11),
    };
    setTrades([...trades, trade]);
    setIsFormOpen(false);
  };

  const handleDeleteTrade = (id: string) => {
    if (window.confirm("Are you sure you want to delete this trade?")) {
      setTrades(trades.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--dashboard-shell)] bg-dot-pattern text-foreground">
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        {/* Filter Bar */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LineChart className="size-5" />
            </div>
            <h2 className="text-lg font-medium text-foreground">
              Dashboard Overview
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
              <Filter className="size-4 text-muted-foreground" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="cursor-pointer bg-transparent text-sm text-foreground focus:outline-none"
              >
                <option value="all" className="bg-card text-foreground">
                  All Time
                </option>
                <option value="7d" className="bg-card text-foreground">
                  Last 7 Days
                </option>
                <option value="30d" className="bg-card text-foreground">
                  Last 30 Days
                </option>
                <option value="month" className="bg-card text-foreground">
                  This Month
                </option>
                <option value="year" className="bg-card text-foreground">
                  This Year
                </option>
                <option value="custom" className="bg-card text-foreground">
                  Custom Range
                </option>
              </select>
            </div>

            {dateFilter === "custom" && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-transparent text-sm text-foreground focus:outline-none"
                  style={{ colorScheme: resolvedTheme }}
                />
                <span className="text-muted-foreground">-</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-transparent text-sm text-foreground focus:outline-none"
                  style={{ colorScheme: resolvedTheme }}
                />
              </div>
            )}

            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Plus className="size-4" />
              Log Trade
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Net P&L"
            value={formatCurrency(stats.totalPnl)}
            icon={<Wallet className="w-5 h-5" />}
            trend={{
              value: stats.totalPnl !== 0 ? 100 : 0,
              isPositive: stats.totalPnl >= 0,
              label: "All time",
            }}
          />
          <StatCard
            title="Win Rate"
            value={formatPercentage(stats.winRate)}
            icon={<Target className="w-5 h-5" />}
          />
          <StatCard
            title="Profit Factor"
            value={stats.profitFactor.toFixed(2)}
            icon={<Activity className="w-5 h-5" />}
            trend={{
              value: stats.profitFactor > 1 ? 100 : 0,
              isPositive: stats.profitFactor >= 1,
              label: "Gross Profit / Gross Loss",
            }}
          />
          <StatCard
            title="Total Trades"
            value={stats.totalTrades}
            icon={<TrendingUp className="w-5 h-5" />}
          />
        </div>

        {/* Charts */}
        <DashboardCharts trades={filteredTrades} />

        {/* Secondary Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="flex flex-col justify-center rounded-2xl border border-border bg-card p-5 shadow-sm">
            <span className="mb-1 text-sm text-muted-foreground">
              Average Win
            </span>
            <span className="text-xl font-semibold text-emerald-400">
              {formatCurrency(stats.averageWin)}
            </span>
          </div>
          <div className="flex flex-col justify-center rounded-2xl border border-border bg-card p-5 shadow-sm">
            <span className="mb-1 text-sm text-muted-foreground">
              Average Loss
            </span>
            <span className="text-xl font-semibold text-rose-400">
              -{formatCurrency(stats.averageLoss)}
            </span>
          </div>
          <div className="flex flex-col justify-center rounded-2xl border border-border bg-card p-5 shadow-sm">
            <span className="mb-1 text-sm text-muted-foreground">
              Largest Win
            </span>
            <span className="text-xl font-semibold text-emerald-400">
              {formatCurrency(stats.largestWin)}
            </span>
          </div>
          <div className="flex flex-col justify-center rounded-2xl border border-border bg-card p-5 shadow-sm">
            <span className="mb-1 text-sm text-muted-foreground">
              Largest Loss
            </span>
            <span className="text-xl font-semibold text-rose-400">
              {formatCurrency(stats.largestLoss)}
            </span>
          </div>
        </div>

        {/* Trade List */}
        <TradeListPanel trades={filteredTrades} onDelete={handleDeleteTrade} />
      </main>

      {/* Modals */}
      {isFormOpen && (
        <TradeForm
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleAddTrade}
        />
      )}
    </div>
  );
}
