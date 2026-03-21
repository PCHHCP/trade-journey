import { LaptopMinimal, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import type { ThemeMode } from "@/types/theme";

const THEME_OPTIONS: Array<{
  label: string;
  shortLabel: string;
  value: ThemeMode;
  icon: typeof Sun;
}> = [
  { label: "Light", shortLabel: "L", value: "light", icon: Sun },
  { label: "Dark", shortLabel: "D", value: "dark", icon: Moon },
  { label: "System", shortLabel: "S", value: "system", icon: LaptopMinimal },
];

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Theme switcher"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 p-1 text-foreground shadow-sm backdrop-blur-md",
        className,
      )}
    >
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => setTheme(option.value)}
            className={cn(
              "inline-flex h-8 items-center justify-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition-colors sm:px-3",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" />
            <span className="hidden sm:inline">{option.label}</span>
            <span className="sm:hidden">{option.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
