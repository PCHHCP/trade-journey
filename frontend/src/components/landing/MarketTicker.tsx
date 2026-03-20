const MARKET_ITEMS = [
  { name: "S&P 500", value: "5,214.21", change: "+0.18%", direction: "up" },
  { name: "HKEX", value: "18,234.90", change: "-1.12%", direction: "down" },
  { name: "TSE", value: "32,145.67", change: "+0.84%", direction: "up" },
  { name: "NASDAQ", value: "15,231.00", change: "+1.22%", direction: "up" },
  { name: "NYSE", value: "34,812.45", change: "+0.42%", direction: "up" },
  { name: "BTC", value: "84,210.11", change: "+2.07%", direction: "up" },
] as const;

interface TickerItemProps {
  name: string;
  value: string;
  change: string;
  direction: "up" | "down";
}

function TickerItem({ name, value, change, direction }: TickerItemProps) {
  const toneClass = direction === "up" ? "text-[#5fe0ff]" : "text-[#ff9f95]";
  const marker = direction === "up" ? "▲" : "▼";

  return (
    <div className="flex shrink-0 items-center gap-3 px-5 py-4">
      <span className="text-sm font-semibold tracking-[0.18em] text-white/65 uppercase">
        {name}
      </span>
      <span className={`text-lg font-medium ${toneClass}`}>
        {marker} {value} ({change})
      </span>
    </div>
  );
}

export function MarketTicker() {
  const items = [...MARKET_ITEMS, ...MARKET_ITEMS];

  return (
    <div
      aria-label="市场行情滚动预留栏"
      className="relative overflow-hidden border-t border-[#123f2d] bg-[#07110f]/88"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00d26a]/80 to-transparent" />
      <div className="ticker-fade relative overflow-hidden border-t border-white/6">
        <div className="ticker-track flex min-w-max items-center">
          {items.map((item, index) => (
            <TickerItem
              key={`${item.name}-${index}`}
              name={item.name}
              value={item.value}
              change={item.change}
              direction={item.direction}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
