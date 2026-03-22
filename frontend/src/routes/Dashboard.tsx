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
  Upload,
  Calendar,
  AlertCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { useTrades } from "@/hooks/useTrades";
import { useTradingAccounts } from "@/hooks/useTradingAccounts";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { TradeListPanel } from "@/components/dashboard/TradeListPanel";
import { TradeCalendar } from "@/components/dashboard/TradeCalendar";
import { ImportDialog } from "@/components/dashboard/ImportDialog";
import { formatCurrency, formatNumber, formatRatioPercent } from "@/lib/locale";
import type { TradeStats } from "@/components/dashboard/types";

const DATE_FILTERS = [
  { id: "all", labelKey: "dashboard.filterPills.all" },
  { id: "7d", labelKey: "dashboard.filterPills.last7Days" },
  { id: "30d", labelKey: "dashboard.filterPills.last30Days" },
  { id: "month", labelKey: "dashboard.filterPills.thisMonth" },
  { id: "year", labelKey: "dashboard.filterPills.thisYear" },
  { id: "custom", labelKey: "dashboard.filterPills.custom" },
] as const;

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export function Dashboard() {
  const { t } = useTranslation();
  const { language } = useAppLanguage();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const { data: accountsData } = useTradingAccounts();
  const accounts = accountsData ?? [];

  const {
    data: tradesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useTrades({
    accountId: selectedAccountId || undefined,
    limit: 500,
  });

  const trades = useMemo(() => tradesData?.trades ?? [], [tradesData]);

  const filteredTrades = useMemo(() => {
    const now = new Date();
    return trades.filter((trade) => {
      const tradeDate = parseISO(trade.open_time);
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
      };
    }

    const wins = filteredTrades.filter((t) => t.profit > 0);
    const losses = filteredTrades.filter((t) => t.profit <= 0);

    const grossProfit = wins.reduce((sum, t) => sum + t.profit, 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.profit, 0));
    const totalPnl = grossProfit - grossLoss;

    const winRate = (wins.length / filteredTrades.length) * 100;
    const profitFactor =
      grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

    const averageWin = wins.length > 0 ? grossProfit / wins.length : 0;
    const averageLoss = losses.length > 0 ? grossLoss / losses.length : 0;

    return {
      totalTrades: filteredTrades.length,
      winRate,
      totalPnl,
      profitFactor,
      averageWin,
      averageLoss,
    };
  }, [filteredTrades]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.08 }}
        >
          {/* Utility bar */}
          <motion.div
            variants={fadeIn}
            className="mb-6 flex items-center justify-between"
          >
            <span className="font-display text-3xl tracking-wide text-[var(--brand)]">
              {t("common.brand")}
            </span>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
              <AccountMenu compact className="bg-card" />
            </div>
          </motion.div>

          {/* Filter + Actions */}
          <motion.div
            variants={fadeIn}
            className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-wrap items-center gap-3">
              {/* Account Selector */}
              {accounts.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="appearance-none rounded-xl border border-border bg-card py-1.5 pl-3 pr-8 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none"
                  >
                    <option value="">
                      {t("dashboard.accountSelector.all")}
                    </option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.account_name} ({account.account_number})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              )}

              <div className="flex rounded-xl border border-border bg-card p-1">
                {DATE_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setDateFilter(filter.id)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      dateFilter === filter.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {t(filter.labelKey)}
                  </button>
                ))}
              </div>

              {dateFilter === "custom" && (
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5">
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
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsImportOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Upload className="size-4" />
                {t("dashboard.actions.importData")}
              </button>
            </div>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <motion.div
              variants={fadeIn}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-20"
            >
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t("dashboard.states.loading")}
              </p>
            </motion.div>
          )}

          {/* Error State */}
          {isError && (
            <motion.div
              variants={fadeIn}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-20"
            >
              <AlertCircle className="size-8 text-[var(--loss)]" />
              <p className="text-sm text-muted-foreground">
                {(error as Error).message || t("dashboard.states.error")}
              </p>
              <button
                onClick={() => void refetch()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t("dashboard.states.retryAction")}
              </button>
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && trades.length === 0 && (
            <motion.div
              variants={fadeIn}
              className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card py-20"
            >
              <Upload className="size-10 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                {t("dashboard.states.empty")}
              </p>
              <button
                onClick={() => setIsImportOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                <Upload className="size-4" />
                {t("dashboard.actions.importData")}
              </button>
            </motion.div>
          )}

          {/* Data Content */}
          {!isLoading && !isError && trades.length > 0 && (
            <>
              {/* Stats Bar */}
              <motion.div
                variants={fadeIn}
                className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4"
              >
                {/* Net P&L */}
                <div className="flex flex-col gap-1 bg-card p-5">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t("dashboard.stats.netPnl")}
                  </span>
                  <span
                    className={`text-2xl font-bold tracking-tight ${stats.totalPnl >= 0 ? "text-[var(--profit)]" : "text-[var(--loss)]"}`}
                  >
                    {stats.totalPnl >= 0 ? "+" : ""}
                    {formatCurrency(stats.totalPnl, language)}
                  </span>
                </div>

                {/* Win Rate */}
                <div className="flex flex-col gap-1 bg-card p-5">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t("dashboard.stats.winRate")}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-foreground">
                      {formatRatioPercent(stats.winRate, language)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {stats.totalTrades}{" "}
                      {t("dashboard.stats.totalTrades").toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Profit Factor */}
                <div className="flex flex-col gap-1 bg-card p-5">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t("dashboard.stats.profitFactor")}
                  </span>
                  <span className="text-2xl font-bold tracking-tight text-foreground">
                    {formatNumber(stats.profitFactor, language, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                {/* Avg Win / Loss */}
                <div className="flex flex-col gap-1 bg-card p-5">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t("dashboard.stats.averageWin")} /{" "}
                    {t("dashboard.stats.averageLoss")}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-semibold text-[var(--profit)]">
                      +{formatCurrency(stats.averageWin, language)}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-lg font-semibold text-[var(--loss)]">
                      -{formatCurrency(stats.averageLoss, language)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Charts */}
              <motion.div variants={fadeIn}>
                <DashboardCharts trades={filteredTrades} />
              </motion.div>

              {/* Trade Calendar */}
              <motion.div variants={fadeIn} className="mb-8">
                <TradeCalendar trades={filteredTrades} />
              </motion.div>

              {/* Trade List */}
              <motion.div variants={fadeIn}>
                <TradeListPanel trades={filteredTrades} />
              </motion.div>
            </>
          )}
        </motion.div>
      </main>

      {isImportOpen && <ImportDialog onClose={() => setIsImportOpen(false)} />}
    </div>
  );
}
