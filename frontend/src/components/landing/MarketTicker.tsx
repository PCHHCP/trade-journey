import { useTranslation } from "react-i18next";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { formatMarketValue, formatSignedPercent } from "@/lib/locale";

const MARKET_ITEMS = [
  { name: "S&P 500", value: 5214.21, change: 0.18, direction: "up" },
  { name: "HKEX", value: 18234.9, change: -1.12, direction: "down" },
  { name: "TSE", value: 32145.67, change: 0.84, direction: "up" },
  { name: "NASDAQ", value: 15231, change: 1.22, direction: "up" },
  { name: "NYSE", value: 34812.45, change: 0.42, direction: "up" },
  { name: "BTC", value: 84210.11, change: 2.07, direction: "up" },
] as const;

interface TickerItemProps {
  name: string;
  value: number;
  change: number;
  direction: "up" | "down";
  language: "en-US" | "zh-CN";
}

function TickerItem({
  name,
  value,
  change,
  direction,
  language,
}: TickerItemProps) {
  const toneClass =
    direction === "up"
      ? "text-[var(--ticker-up)]"
      : "text-[var(--ticker-down)]";
  const marker = direction === "up" ? "▲" : "▼";

  return (
    <div className="flex shrink-0 items-center gap-3 px-5 py-4">
      <span className="text-sm font-semibold tracking-[0.18em] text-[var(--ticker-label)] uppercase">
        {name}
      </span>
      <span className={`text-lg font-medium ${toneClass}`}>
        {marker} {formatMarketValue(value, language)} (
        {formatSignedPercent(change, language)})
      </span>
    </div>
  );
}

export function MarketTicker() {
  const { t } = useTranslation();
  const { language } = useAppLanguage();
  const items = [...MARKET_ITEMS, ...MARKET_ITEMS];

  return (
    <div
      aria-label={t("landing.ticker.ariaLabel")}
      className="relative overflow-hidden border-t border-[var(--ticker-border)] bg-[var(--ticker-bg)]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--ticker-highlight)] to-transparent" />
      <div className="ticker-fade relative overflow-hidden border-t border-[var(--ticker-divider)]">
        <div className="ticker-track flex min-w-max items-center">
          {items.map((item, index) => (
            <TickerItem
              key={`${item.name}-${index}`}
              name={item.name}
              value={item.value}
              change={item.change}
              direction={item.direction}
              language={language}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
