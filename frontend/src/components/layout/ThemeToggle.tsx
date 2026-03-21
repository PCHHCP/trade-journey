import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import type { ResolvedTheme } from "@/types/theme";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const nextTheme: ResolvedTheme = resolvedTheme === "dark" ? "light" : "dark";
  const Icon = nextTheme === "dark" ? Moon : Sun;
  const actionLabel = t(
    nextTheme === "dark"
      ? "common.themeToggle.switchToDark"
      : "common.themeToggle.switchToLight",
  );

  return (
    <button
      type="button"
      aria-label={actionLabel}
      aria-pressed={resolvedTheme === "dark"}
      title={actionLabel}
      onClick={() => setTheme(nextTheme)}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-[1.15rem] border border-border/70 bg-background/95 text-slate-600 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45),0_2px_8px_-4px_rgba(15,23,42,0.12)] backdrop-blur-md transition-[transform,box-shadow,color,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:bg-accent/70 hover:text-foreground hover:shadow-[0_16px_36px_-20px_rgba(15,23,42,0.5),0_6px_12px_-6px_rgba(15,23,42,0.16)] focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 dark:text-slate-300",
        className,
      )}
    >
      <Icon className="size-5" strokeWidth={2.2} />
    </button>
  );
}
