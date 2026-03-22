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
  Target,
  Plus,
  Upload,
  LineChart,
  Wallet,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { ROUTES } from "@/config/routes";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { useDelayedResolvedTheme } from "@/hooks/useDelayedResolvedTheme";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { TradeListPanel } from "@/components/dashboard/TradeListPanel";
import { TradeCalendar } from "@/components/dashboard/TradeCalendar";
import { TradeForm } from "@/components/dashboard/TradeForm";
import { initialTrades } from "@/components/dashboard/mockData";
import { formatCurrency, formatNumber, formatRatioPercent } from "@/lib/locale";
import type { DashboardTrade, TradeStats } from "@/components/dashboard/types";

const DASHBOARD_BACKGROUND_DELAY_MS = 300;

const DATE_FILTERS = [
  { id: "all", labelKey: "dashboard.filterPills.all" },
  { id: "7d", labelKey: "dashboard.filterPills.last7Days" },
  { id: "30d", labelKey: "dashboard.filterPills.last30Days" },
  { id: "month", labelKey: "dashboard.filterPills.thisMonth" },
  { id: "year", labelKey: "dashboard.filterPills.thisYear" },
  { id: "custom", labelKey: "dashboard.filterPills.custom" },
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
        backgroundColor: backgroundTheme === "dark" ? "oklch(0.155 0.018 270)" : "oklch(0.97 0.008 270)",
        backgroundImage:
          backgroundTheme === "dark"
            ? "radial-gradient(oklch(1 0 0 / 6%) 1px, transparent 1px)"
            : "radial-gradient(oklch(0.50 0.04 270 / 16%) 1px, transparent 1px)",
      }}
      transition={{ duration: 0.5 }}
      style={{ backgroundPosition: "0 0", backgroundSize: "24px 24px" }}
    >
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Filter Bar */}
          <motion.div
            variants={itemVariants}
            className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
          >
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

              {/* Pill-style filter buttons */}
              <div className="flex rounded-xl border border-border bg-card p-1 shadow-sm">
                {DATE_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setDateFilter(filter.id)}
                    className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                      dateFilter === filter.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {t(filter.labelKey)}
                  </button>
                ))}
              </div>

              {dateFilter === "custom" && (
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 shadow-sm">
                  <Calendar className="size-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-transparent text-sm text-foreground focus:outline-none"
                    style={{ colorScheme: "light dark" }}
                  />
                  <span className="text-muted-foreground opacity-50">-</span>
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
                onClick={() => void navigate(ROUTES.IMPORT)}
                className="inline-flex w-[9.5rem] shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
              >
                <Upload className="size-4" />
                {t("dashboard.actions.importData")}
              </button>
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex w-[9.5rem] shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted dark:border-transparent dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
              >
                <Plus className="size-4" />
                {t("dashboard.actions.logTrade")}
              </button>
              <AccountMenu compact className="bg-card sm:ml-auto" />
            </div>
          </motion.div>

          {/* Bento Grid Stats */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            {/* Hero P&L */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="relative flex min-h-[260px] flex-col justify-center overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-lg hover:shadow-black/5 md:col-span-2 dark:hover:shadow-black/20"
            >
              <div
                className={`absolute -top-32 -right-32 h-96 w-96 rounded-full blur-[100px] transition-colors duration-500 ${stats.totalPnl >= 0 ? "bg-[var(--profit)] opacity-10 dark:opacity-20" : "bg-[var(--loss)] opacity-10 dark:opacity-20"}`}
              />
              <div className="relative z-10">
                <div className="mb-6 flex items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-full border border-border bg-muted">
                    <Wallet className="size-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-muted-foreground">
                    {t("dashboard.stats.netPnl")}
                  </h3>
                </div>
                <div
                  className={`text-6xl font-bold tracking-tight md:text-7xl ${stats.totalPnl >= 0 ? "text-[var(--profit)]" : "text-[var(--loss)]"}`}
                >
                  {stats.totalPnl >= 0 ? "+" : ""}
                  {formatCurrency(stats.totalPnl, language)}
                </div>
              </div>
            </motion.div>

            {/* Win Rate & Profit Factor (stacked) */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-6 md:col-span-1"
            >
              <motion.div
                whileHover={{ y: -4 }}
                className="relative flex flex-1 flex-col justify-center overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
              >
                <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-[var(--brand-soft)] blur-3xl" />
                <h3 className="relative z-10 mb-3 flex items-center gap-2 font-medium text-muted-foreground">
                  <Target className="size-4" /> {t("dashboard.stats.winRate")}
                </h3>
                <div className="relative z-10 mb-4 text-4xl font-bold text-foreground">
                  {formatRatioPercent(stats.winRate, language)}
                </div>
                <div className="relative z-10 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-[var(--brand)] transition-all duration-1000 ease-out"
                    style={{ width: `${stats.winRate}%` }}
                  />
                </div>
              </motion.div>
              <motion.div
                whileHover={{ y: -4 }}
                className="flex flex-1 flex-col justify-center rounded-3xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
              >
                <h3 className="mb-2 flex items-center gap-2 font-medium text-muted-foreground">
                  <Activity className="size-4" />{" "}
                  {t("dashboard.stats.profitFactor")}
                </h3>
                <div className="text-4xl font-bold text-foreground">
                  {formatNumber(stats.profitFactor, language, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </motion.div>
            </motion.div>

            {/* Trade Analysis */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg hover:shadow-black/5 md:col-span-1 dark:hover:shadow-black/20"
            >
              <h3 className="mb-6 font-medium text-muted-foreground">
                {t("dashboard.calendar.tradeAnalysis")}
              </h3>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("dashboard.stats.totalTrades")}
                  </span>
                  <span className="text-lg font-semibold text-foreground">
                    {stats.totalTrades}
                  </span>
                </div>
                <div className="h-px w-full bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("dashboard.stats.averageWin")}
                  </span>
                  <span className="font-semibold text-[var(--profit)]">
                    +{formatCurrency(stats.averageWin, language)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("dashboard.stats.averageLoss")}
                  </span>
                  <span className="font-semibold text-[var(--loss)]">
                    -{formatCurrency(stats.averageLoss, language)}
                  </span>
                </div>
                <div className="h-px w-full bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("dashboard.stats.largestWin")}
                  </span>
                  <span className="font-medium text-[var(--profit)] opacity-80">
                    +{formatCurrency(stats.largestWin, language)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("dashboard.stats.largestLoss")}
                  </span>
                  <span className="font-medium text-[var(--loss)] opacity-80">
                    -{formatCurrency(Math.abs(stats.largestLoss), language)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts */}
          <motion.div variants={itemVariants}>
            <DashboardCharts trades={filteredTrades} />
          </motion.div>

          {/* Trade Calendar */}
          <motion.div variants={itemVariants} className="mb-8">
            <TradeCalendar trades={filteredTrades} />
          </motion.div>

          {/* Trade List */}
          <motion.div variants={itemVariants}>
            <TradeListPanel
              trades={filteredTrades}
              onDelete={handleDeleteTrade}
            />
          </motion.div>
        </motion.div>
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
