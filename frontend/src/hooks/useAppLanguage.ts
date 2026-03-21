import { enUS, zhCN } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import {
  formatCurrency,
  formatDateTimeValue,
  formatNumber,
  formatRatioPercent,
} from "@/lib/locale";
import { resolveLanguage } from "@/lib/i18n";
import type { AppLanguage } from "@/types/i18n";

const DATE_FNS_LOCALES = {
  "en-US": enUS,
  "zh-CN": zhCN,
} as const;

export function useAppLanguage() {
  const { i18n } = useTranslation();
  const language = resolveLanguage(i18n.resolvedLanguage ?? i18n.language);

  return {
    language,
    dateFnsLocale: DATE_FNS_LOCALES[language],
    setLanguage(nextLanguage: AppLanguage) {
      return i18n.changeLanguage(nextLanguage);
    },
  };
}

export function useLocaleFormatting() {
  const { language, dateFnsLocale } = useAppLanguage();

  return {
    language,
    dateFnsLocale,
    formatCurrency(value: number, currency?: string) {
      return formatCurrency(value, language, currency);
    },
    formatNumber(value: number, options?: Intl.NumberFormatOptions) {
      return formatNumber(value, language, options);
    },
    formatPercentage(value: number) {
      return formatRatioPercent(value, language);
    },
    formatDateTime(value: Date | string | number) {
      return formatDateTimeValue(value, language, dateFnsLocale);
    },
  };
}
