import type { ReactNode } from "react";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { formatNumber } from "@/lib/locale";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  className,
}: StatCardProps) {
  const { language } = useAppLanguage();

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-6 shadow-sm",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight text-foreground">
          {value}
        </span>
      </div>
      {trend && (
        <div className="mt-2 flex items-center text-sm">
          <span
            className={cn(
              "font-medium",
              trend.isPositive ? "text-[var(--profit)]" : "text-[var(--loss)]",
            )}
          >
            {trend.isPositive ? "+" : "-"}
            {formatNumber(Math.abs(trend.value), language)}%
          </span>
          {trend.label && (
            <span className="ml-2 text-muted-foreground">{trend.label}</span>
          )}
        </div>
      )}
    </div>
  );
}
