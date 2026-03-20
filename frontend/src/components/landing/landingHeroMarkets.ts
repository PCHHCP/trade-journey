export interface GlobeMarketDefinition {
  id: string;
  code: string;
  name: string;
  marketType: string;
  country: string;
  countryCode: string;
  location: [number, number];
}

export const LANDING_HERO_MARKETS: readonly GlobeMarketDefinition[] = [
  {
    id: "new-york",
    code: "NYSE",
    name: "New York Stock Exchange",
    marketType: "Equities",
    country: "United States",
    countryCode: "US",
    location: [40.7128, -74.006],
  },
  {
    id: "chicago",
    code: "CME",
    name: "Chicago Mercantile Exchange",
    marketType: "Futures",
    country: "United States",
    countryCode: "US",
    location: [41.8781, -87.6298],
  },
  {
    id: "tokyo",
    code: "TSE",
    name: "Tokyo Stock Exchange",
    marketType: "Equities",
    country: "Japan",
    countryCode: "JP",
    location: [35.6764, 139.65],
  },
  {
    id: "hong-kong",
    code: "HKEX",
    name: "Hong Kong Exchanges",
    marketType: "Equities",
    country: "Hong Kong SAR",
    countryCode: "HK",
    location: [22.3193, 114.1694],
  },
  {
    id: "shanghai",
    code: "SSE",
    name: "Shanghai Stock Exchange",
    marketType: "Equities",
    country: "China",
    countryCode: "CN",
    location: [31.2304, 121.4737],
  },
  {
    id: "london",
    code: "LSE",
    name: "London Stock Exchange",
    marketType: "Equities",
    country: "United Kingdom",
    countryCode: "UK",
    location: [51.5072, -0.1276],
  },
] as const;
