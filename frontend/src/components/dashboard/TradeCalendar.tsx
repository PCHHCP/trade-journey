import { useState, useMemo } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  eachDayOfInterval,
  parseISO,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from "@/components/ui/panel";
import { formatCurrency } from "@/lib/locale";
import type { DashboardTrade } from "./types";

function formatCompactCurrency(value: number) {
  const absValue = Math.abs(value);
  if (absValue >= 1000) {
    const kValue = absValue / 1000;
    return `${value < 0 ? "-" : ""}$${kValue.toFixed(2)}K`;
  }
  return `${value < 0 ? "-" : ""}$${absValue.toFixed(0)}`;
}

interface TradeCalendarProps {
  trades: DashboardTrade[];
}

export function TradeCalendar({ trades }: TradeCalendarProps) {
  const { t } = useTranslation();
  const { language, dateFnsLocale } = useAppLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { locale: dateFnsLocale });
  const calendarEnd = endOfWeek(monthEnd, { locale: dateFnsLocale });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const dayHeaders = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { locale: dateFnsLocale });
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      return format(day, "EEE", { locale: dateFnsLocale });
    });
  }, [dateFnsLocale]);

  const tradesByDay = useMemo(() => {
    const grouped: Record<string, DashboardTrade[]> = {};
    trades.forEach((trade) => {
      const dateStr = trade.date.split("T")[0];
      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push(trade);
    });
    return grouped;
  }, [trades]);

  const monthlyStats = useMemo(() => {
    const currentMonthTrades = trades.filter((t) =>
      isSameMonth(parseISO(t.date), currentDate),
    );
    const pnl = currentMonthTrades.reduce((sum, t) => sum + t.pnl, 0);
    const daysTraded = new Set(
      currentMonthTrades.map((t) => t.date.split("T")[0]),
    ).size;
    return { pnl, daysTraded };
  }, [trades, currentDate]);

  const weeks = useMemo(() => {
    const weekArray: Date[][] = [];
    let currentWeek: Date[] = [];

    for (let i = 0; i < days.length; i++) {
      currentWeek.push(days[i]);
      if (currentWeek.length === 7) {
        weekArray.push(currentWeek);
        currentWeek = [];
      }
    }
    return weekArray;
  }, [days]);

  return (
    <Panel>
      {/* Header */}
      <PanelHeader className="flex-col items-start sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button onClick={prevMonth} variant="ghost" size="icon-sm">
              <ChevronLeft className="size-5 text-muted-foreground" />
            </Button>
            <PanelTitle className="w-36 text-center text-xl">
              {format(currentDate, "MMMM yyyy", { locale: dateFnsLocale })}
            </PanelTitle>
            <Button onClick={nextMonth} variant="ghost" size="icon-sm">
              <ChevronRight className="size-5 text-muted-foreground" />
            </Button>
          </div>
          <Button
            onClick={goToToday}
            variant="secondary"
            size="lg"
            className="text-muted-foreground"
          >
            {t("dashboard.calendar.thisMonth")}
          </Button>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm">
          <span className="font-medium text-muted-foreground">
            {t("dashboard.calendar.monthlyStats")}:
          </span>
          <span
            className={`font-semibold ${monthlyStats.pnl >= 0 ? "text-[var(--profit)]" : "text-[var(--loss)]"}`}
          >
            {monthlyStats.pnl >= 0 ? "+" : ""}
            {formatCurrency(monthlyStats.pnl, language)}
          </span>
          <span className="rounded-md bg-muted px-2 py-1 font-medium text-muted-foreground">
            {monthlyStats.daysTraded === 1
              ? t("dashboard.calendar.day", {
                  count: monthlyStats.daysTraded,
                })
              : t("dashboard.calendar.days", {
                  count: monthlyStats.daysTraded,
                })}
          </span>
        </div>
      </PanelHeader>

      <PanelContent className="pt-0">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {/* Calendar Grid */}
          <div className="min-w-[700px] flex-1">
            {/* Days of week */}
            <div className="mb-2 grid grid-cols-7 gap-2">
              {dayHeaders.map((dayName) => (
                <div
                  key={dayName}
                  className="py-2 text-center text-sm font-medium text-muted-foreground"
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const dayTrades = tradesByDay[dateStr] || [];
                const isCurrentMonth = isSameMonth(day, currentDate);

                const pnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
                const winCount = dayTrades.filter((t) => t.pnl > 0).length;
                const winRate =
                  dayTrades.length > 0
                    ? (winCount / dayTrades.length) * 100
                    : 0;

                let bgClass = "bg-muted/30 border-transparent";
                let textClass = "text-muted-foreground";

                if (dayTrades.length > 0) {
                  if (pnl > 0) {
                    bgClass =
                      "bg-[var(--profit-soft)] border-[var(--profit)]/20";
                    textClass = "text-[var(--profit)]";
                  } else if (pnl < 0) {
                    bgClass = "bg-[var(--loss-soft)] border-[var(--loss)]/20";
                    textClass = "text-[var(--loss)]";
                  } else {
                    bgClass =
                      "bg-[var(--neutral-accent-soft)] border-[var(--neutral-accent)]/20";
                    textClass = "text-[var(--neutral-accent)]";
                  }
                }

                if (!isCurrentMonth) {
                  bgClass = "bg-muted/10 border-transparent opacity-40";
                }

                return (
                  <div
                    key={day.toString()}
                    className={`flex min-h-[110px] flex-col rounded-lg border p-2 transition-colors ${bgClass}`}
                  >
                    <div className="mb-1 flex items-start justify-between">
                      {dayTrades.length > 0 ? (
                        <CalendarIcon className="size-4 text-muted-foreground opacity-50" />
                      ) : (
                        <div />
                      )}
                      <span
                        className={`text-sm font-medium ${isCurrentMonth ? "text-muted-foreground" : "text-muted-foreground opacity-50"}`}
                      >
                        {format(day, "d")}
                      </span>
                    </div>

                    {dayTrades.length > 0 && (
                      <div className="mt-1 flex flex-1 flex-col items-center justify-center">
                        <span className={`text-base font-bold ${textClass}`}>
                          {pnl > 0 ? "+" : ""}
                          {formatCompactCurrency(pnl)}
                        </span>
                        <span className="mt-1 text-[11px] font-medium text-muted-foreground">
                          {dayTrades.length === 1
                            ? t("dashboard.calendar.trade", {
                                count: dayTrades.length,
                              })
                            : t("dashboard.calendar.trades", {
                                count: dayTrades.length,
                              })}
                        </span>
                        <span className="text-[11px] font-medium text-muted-foreground opacity-70">
                          {winRate.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Summary Sidebar */}
          <div className="flex w-24 shrink-0 flex-col gap-2 pt-[40px]">
            {weeks.map((week, i) => {
              const weekTrades = week.flatMap(
                (day) => tradesByDay[format(day, "yyyy-MM-dd")] || [],
              );
              const pnl = weekTrades.reduce((sum, t) => sum + t.pnl, 0);
              const daysTraded = new Set(
                weekTrades.map((t) => t.date.split("T")[0]),
              ).size;

              return (
                <div
                  key={i}
                  className="flex h-[110px] flex-col items-center justify-center rounded-lg border border-border bg-muted/50 p-2"
                >
                  <span className="mb-1 text-xs font-medium text-muted-foreground">
                    {t("dashboard.calendar.week", { number: i + 1 })}
                  </span>
                  <span
                    className={`text-sm font-bold ${pnl > 0 ? "text-[var(--profit)]" : pnl < 0 ? "text-[var(--loss)]" : "text-muted-foreground"}`}
                  >
                    {pnl > 0 ? "+" : ""}
                    {formatCompactCurrency(pnl)}
                  </span>
                  <span className="mt-1 rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {daysTraded === 1
                      ? t("dashboard.calendar.day", { count: daysTraded })
                      : t("dashboard.calendar.days", { count: daysTraded })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </PanelContent>
    </Panel>
  );
}
