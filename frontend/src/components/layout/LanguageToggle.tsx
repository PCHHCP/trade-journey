import { startTransition } from "react";
import { useTranslation } from "react-i18next";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { cn } from "@/lib/utils";
import type { AppLanguage } from "@/types/i18n";

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { t } = useTranslation();
  const { language, setLanguage } = useAppLanguage();
  const nextLanguage: AppLanguage = language === "zh-CN" ? "en-US" : "zh-CN";
  const actionLabel = t(
    nextLanguage === "en-US"
      ? "common.languageToggle.switchToEnglish"
      : "common.languageToggle.switchToChinese",
  );

  return (
    <button
      type="button"
      aria-label={actionLabel}
      aria-pressed={language === "zh-CN"}
      title={actionLabel}
      onClick={() => {
        startTransition(() => {
          void setLanguage(nextLanguage);
        });
      }}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-[1.15rem] border border-border/70 bg-background/95 text-slate-700 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45),0_2px_8px_-4px_rgba(15,23,42,0.12)] backdrop-blur-md transition-[transform,box-shadow,color,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:bg-accent/70 hover:text-foreground hover:shadow-[0_16px_36px_-20px_rgba(15,23,42,0.5),0_6px_12px_-6px_rgba(15,23,42,0.16)] focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 dark:text-slate-200",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="relative inline-flex size-5 items-center justify-center font-sans"
      >
        <span className="absolute left-0 top-0 size-1 rounded-full bg-current/45" />
        <span className="absolute left-0 bottom-0 text-[0.95rem] leading-none font-semibold">
          文
        </span>
        <span className="absolute right-0 top-[0.05rem] text-[0.8rem] leading-none font-semibold">
          A
        </span>
      </span>
    </button>
  );
}
