import { format } from "date-fns";
import type { Locale } from "date-fns";
import type { AppLanguage } from "@/types/i18n";

type DateInput = Date | string | number;

function toDate(value: DateInput) {
  return value instanceof Date ? value : new Date(value);
}

export function formatCurrency(
  value: number,
  language: AppLanguage,
  currency = "USD",
) {
  return new Intl.NumberFormat(language, {
    style: "currency",
    currency,
    signDisplay: "auto",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(
  value: number,
  language: AppLanguage,
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat(language, options).format(value);
}

export function formatRatioPercent(value: number, language: AppLanguage) {
  return new Intl.NumberFormat(language, {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export function formatSignedPercent(value: number, language: AppLanguage) {
  return new Intl.NumberFormat(language, {
    style: "percent",
    signDisplay: "always",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function formatMarketValue(value: number, language: AppLanguage) {
  return formatNumber(value, language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatLongDate(
  value: DateInput,
  language: AppLanguage,
  locale: Locale,
) {
  return format(
    toDate(value),
    language === "zh-CN" ? "yyyy年MM月dd日" : "MMM dd, yyyy",
    { locale },
  );
}

export function formatChartDate(
  value: DateInput,
  language: AppLanguage,
  locale: Locale,
) {
  return format(toDate(value), language === "zh-CN" ? "M月dd日" : "MMM dd", {
    locale,
  });
}

export function formatDateTimeValue(
  value: DateInput,
  language: AppLanguage,
  locale: Locale,
) {
  return format(
    toDate(value),
    language === "zh-CN" ? "yyyy/MM/dd HH:mm" : "PP p",
    { locale },
  );
}
