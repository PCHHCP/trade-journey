import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import type { ResolvedTheme } from "@/types/theme";

const DEFAULT_DELAY_MS = 300;

export function useDelayedResolvedTheme(
  delayMs = DEFAULT_DELAY_MS,
): ResolvedTheme {
  const { resolvedTheme } = useTheme();
  const [delayedResolvedTheme, setDelayedResolvedTheme] =
    useState<ResolvedTheme>(resolvedTheme);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDelayedResolvedTheme(resolvedTheme);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delayMs, resolvedTheme]);

  return delayedResolvedTheme;
}
