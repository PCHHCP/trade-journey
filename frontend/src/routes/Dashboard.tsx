import { useMemo, useState } from "react";
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
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { useDelayedResolvedTheme } from "@/hooks/useDelayedResolvedTheme";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { TradeListPanel } from "@/components/dashboard/TradeListPanel";
import { TradeForm } from "@/components/dashboard/TradeForm";
import { initialTrades } from "@/components/dashboard/mockData";
import { formatCurrency, formatNumber, formatRatioPercent } from "@/lib/locale";
import type { DashboardTrade, TradeStats } from "@/components/dashboard/types";

const DASHBOARD_BACKGROUND_DELAY_MS = 300;

export function Dashboard() {
  const { t } = useTranslation();
  const { language } = useAppLanguage();
  const backgroundTheme = useDelayedResolvedTheme(
    DASHBOARD_BACKGROUND_DELAY_MS,
  );
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
    if (window.confirm(t("dashboard.actions.confirmDeleteTrade"))) {
      setTrades(trades.filter((t) => t.id !== id));
    }
  };

  return (
    <motion.div
      className="min-h-screen text-foreground"
      animate={{
        backgroundColor: backgroundTheme === "dark" ? "#16171a" : "#f4f7fb",
        backgroundImage:
          backgroundTheme === "dark"
            ? "radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)"
            : "radial-gradient(rgba(148, 163, 184, 0.22) 1px, transparent 1px)",
      }}
      transition={{ duration: 0.5 }}
      style={{ backgroundPosition: "0 0", backgroundSize: "24px 24px" }}
    >
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        {/* Filter Bar */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LineChart className="size-5" />
            </div>
            <h2 className="text-lg font-medium text-foreground">
              {t("dashboard.overviewTitle")}
            </h2>
          </div>
          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:justify-end">
            <LanguageToggle />
            <ThemeToggle />
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
              <Filter className="size-4 text-muted-foreground" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="cursor-pointer bg-transparent text-sm text-foreground focus:outline-none"
              >
                <option value="all" className="bg-card text-foreground">
                  {t("dashboard.filters.all")}
                </option>
                <option value="7d" className="bg-card text-foreground">
                  {t("dashboard.filters.last7Days")}
                </option>
                <option value="30d" className="bg-card text-foreground">
                  {t("dashboard.filters.last30Days")}
                </option>
                <option value="month" className="bg-card text-foreground">
                  {t("dashboard.filters.thisMonth")}
                </option>
                <option value="year" className="bg-card text-foreground">
                  {t("dashboard.filters.thisYear")}
                </option>
                <option value="custom" className="bg-card text-foreground">
                  {t("dashboard.filters.custom")}
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
                  style={{ colorScheme: "light dark" }}
                />
                <span className="text-muted-foreground">-</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-transparent text-sm text-foreground focus:outline-none"
                  style={{ colorScheme: "light dark" }}
                />
              </div>
            )}

            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex w-[9.5rem] shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Plus className="size-4" />
              {t("dashboard.actions.logTrade")}
            </button>
            <AccountMenu compact className="bg-card sm:ml-auto" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t("dashboard.stats.netPnl")}
            value={formatCurrency(stats.totalPnl, language)}
            icon={<Wallet className="w-5 h-5" />}
            trend={{
              value: stats.totalPnl !== 0 ? 100 : 0,
              isPositive: stats.totalPnl >= 0,
              label: t("dashboard.stats.allTime"),
            }}
          />
          <StatCard
            title={t("dashboard.stats.winRate")}
            value={formatRatioPercent(stats.winRate, language)}
            icon={<Target className="w-5 h-5" />}
          />
          <StatCard
            title={t("dashboard.stats.profitFactor")}
            value={formatNumber(stats.profitFactor, language, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            icon={<Activity className="w-5 h-5" />}
            trend={{
              value: stats.profitFactor > 1 ? 100 : 0,
              isPositive: stats.profitFactor >= 1,
              label: t("dashboard.stats.grossProfitOverGrossLoss"),
            }}
          />
          <StatCard
            title={t("dashboard.stats.totalTrades")}
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
              {t("dashboard.stats.averageWin")}
            </span>
            <span className="text-xl font-semibold text-emerald-400">
              {formatCurrency(stats.averageWin, language)}
            </span>
          </div>
          <div className="flex flex-col justify-center rounded-2xl border border-border bg-card p-5 shadow-sm">
            <span className="mb-1 text-sm text-muted-foreground">
              {t("dashboard.stats.averageLoss")}
            </span>
            <span className="text-xl font-semibold text-rose-400">
              -{formatCurrency(stats.averageLoss, language)}
            </span>
          </div>
          <div className="flex flex-col justify-center rounded-2xl border border-border bg-card p-5 shadow-sm">
            <span className="mb-1 text-sm text-muted-foreground">
              {t("dashboard.stats.largestWin")}
            </span>
            <span className="text-xl font-semibold text-emerald-400">
              {formatCurrency(stats.largestWin, language)}
            </span>
          </div>
          <div className="flex flex-col justify-center rounded-2xl border border-border bg-card p-5 shadow-sm">
            <span className="mb-1 text-sm text-muted-foreground">
              {t("dashboard.stats.largestLoss")}
            </span>
            <span className="text-xl font-semibold text-rose-400">
              {formatCurrency(stats.largestLoss, language)}
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
    </motion.div>
  );
}
