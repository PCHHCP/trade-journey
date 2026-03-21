export interface GlobeMarketDefinition {
  id: string;
  code: string;
  marketType: "equities" | "futures";
  countryCode: string;
  location: [number, number];
}

export const LANDING_HERO_MARKETS: readonly GlobeMarketDefinition[] = [
  {
    id: "newYork",
    code: "NYSE",
    marketType: "equities",
    countryCode: "US",
    location: [40.7128, -74.006],
  },
  {
    id: "chicago",
    code: "CME",
    marketType: "futures",
    countryCode: "US",
    location: [41.8781, -87.6298],
  },
  {
    id: "tokyo",
    code: "TSE",
    marketType: "equities",
    countryCode: "JP",
    location: [35.6764, 139.65],
  },
  {
    id: "hongKong",
    code: "HKEX",
    marketType: "equities",
    countryCode: "HK",
    location: [22.3193, 114.1694],
  },
  {
    id: "shanghai",
    code: "SSE",
    marketType: "equities",
    countryCode: "CN",
    location: [31.2304, 121.4737],
  },
  {
    id: "london",
    code: "LSE",
    marketType: "equities",
    countryCode: "GB",
    location: [51.5072, -0.1276],
  },
] as const;
