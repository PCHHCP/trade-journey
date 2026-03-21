import { ReactNode } from 'react';
import { cn } from '../lib/utils';

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

export function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn("bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm transition-shadow hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[var(--text-secondary)]">{title}</h3>
        {icon && <div className="text-[var(--text-secondary)]">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{value}</span>
      </div>
      {trend && (
        <div className="mt-2 flex items-center text-sm">
          <span
            className={cn(
              "font-medium",
              trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}
          >
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
          {trend.label && <span className="text-[var(--text-secondary)] ml-2">{trend.label}</span>}
        </div>
      )}
    </div>
  );
}
