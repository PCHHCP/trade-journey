import { useEffect, useState, type ReactNode } from "react";
import { ThemeContext } from "@/components/layout/ThemeContext";
import type { ResolvedTheme, ThemeMode } from "@/types/theme";

const THEME_STORAGE_KEY = "theme-preference";
const DEFAULT_THEME: ThemeMode = "system";
const NIGHT_START_HOUR = 22;
const DAY_START_HOUR = 6;

interface ThemeProviderProps {
  children: ReactNode;
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function getSystemTheme(date = new Date()): ResolvedTheme {
  const hour = date.getHours();

  if (hour >= NIGHT_START_HOUR || hour < DAY_START_HOUR) {
    return "dark";
  }

  return "light";
}

function getMillisecondsUntilNextThemeChange(date = new Date()) {
  const nextChange = new Date(date);
  const hour = date.getHours();

  if (hour >= NIGHT_START_HOUR) {
    nextChange.setDate(nextChange.getDate() + 1);
    nextChange.setHours(DAY_START_HOUR, 0, 0, 0);
  } else if (hour < DAY_START_HOUR) {
    nextChange.setHours(DAY_START_HOUR, 0, 0, 0);
  } else {
    nextChange.setHours(NIGHT_START_HOUR, 0, 0, 0);
  }

  return Math.max(nextChange.getTime() - date.getTime(), 1000);
}

function resolveTheme(theme: ThemeMode, systemTheme: ResolvedTheme) {
  return theme === "system" ? systemTheme : theme;
}

function applyResolvedTheme(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  root.dataset.theme = theme;
}

function readStoredTheme() {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemeMode(storedTheme) ? storedTheme : DEFAULT_THEME;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeMode>(readStoredTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(readStoredTheme(), getSystemTheme()),
  );

  useEffect(() => {
    if (theme !== "system") {
      return;
    }

    const syncThemeWithCurrentTime = () => {
      setSystemTheme(getSystemTheme());
    };

    const timeoutId = window.setTimeout(
      syncThemeWithCurrentTime,
      getMillisecondsUntilNextThemeChange() + 250,
    );

    window.addEventListener("focus", syncThemeWithCurrentTime);
    document.addEventListener("visibilitychange", syncThemeWithCurrentTime);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("focus", syncThemeWithCurrentTime);
      document.removeEventListener(
        "visibilitychange",
        syncThemeWithCurrentTime,
      );
    };
  }, [theme, systemTheme]);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    const nextResolvedTheme = resolveTheme(theme, systemTheme);
    applyResolvedTheme(nextResolvedTheme);
    setResolvedTheme(nextResolvedTheme);
  }, [theme, systemTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
