import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from "@/components/ui/panel";
import type { DashboardTrade } from "./types";
import { formatChartDate, formatCurrency, formatNumber } from "@/lib/locale";

const tooltipStyle = {
  backgroundColor: "var(--card)",
  borderColor: "var(--border)",
  color: "var(--foreground)",
  borderRadius: "8px",
  boxShadow: "var(--dashboard-tooltip-shadow)",
};
const tooltipItemStyle = { color: "var(--foreground)" };

interface DashboardChartsProps {
  trades: DashboardTrade[];
}

export function DashboardCharts({ trades }: DashboardChartsProps) {
  const { t } = useTranslation();
  const { language, dateFnsLocale } = useAppLanguage();
  const sortedTrades = useMemo(() => {
    return [...trades].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [trades]);

  const cumulativeData = useMemo(() => {
    return sortedTrades.reduce<{ date: string; pnl: number }[]>((acc, t) => {
      const prev = acc.length > 0 ? acc[acc.length - 1].pnl : 0;
      acc.push({
        date: formatChartDate(parseISO(t.date), language, dateFnsLocale),
        pnl: prev + t.pnl,
      });
      return acc;
    }, []);
  }, [dateFnsLocale, language, sortedTrades]);

  const dailyData = useMemo(() => {
    const dailyMap = new Map<string, number>();
    sortedTrades.forEach((t) => {
      const dateStr = formatChartDate(
        parseISO(t.date),
        language,
        dateFnsLocale,
      );
      dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + t.pnl);
    });
    return Array.from(dailyMap.entries()).map(([date, pnl]) => ({ date, pnl }));
  }, [dateFnsLocale, language, sortedTrades]);

  return (
    <div className="mb-8 space-y-6">
      {/* Cumulative PnL Chart */}
      <Panel>
        <PanelHeader>
          <PanelTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {t("dashboard.charts.cumulativePnl")}
          </PanelTitle>
        </PanelHeader>
        <PanelContent className="pt-0">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={cumulativeData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--brand)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--brand)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--dashboard-chart-grid)"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  tickFormatter={(value: number) =>
                    formatNumber(value, language, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  }
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={tooltipItemStyle}
                  formatter={(value) => [
                    formatCurrency(value as number, language),
                    t("dashboard.charts.cumulativePnlSeries"),
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="pnl"
                  stroke="var(--brand)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPnl)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </PanelContent>
      </Panel>

      {/* Daily PnL Bar Chart */}
      <Panel>
        <PanelHeader>
          <PanelTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {t("dashboard.charts.dailyPnl")}
          </PanelTitle>
        </PanelHeader>
        <PanelContent className="pt-0">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--dashboard-chart-grid)"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  tickFormatter={(value: number) =>
                    formatNumber(value, language, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  }
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={tooltipStyle}
                  itemStyle={tooltipItemStyle}
                  formatter={(value) => [
                    formatCurrency(value as number, language),
                    t("dashboard.charts.dailyPnlSeries"),
                  ]}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {dailyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.pnl >= 0 ? "var(--profit)" : "var(--loss)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PanelContent>
      </Panel>
    </div>
  );
}
