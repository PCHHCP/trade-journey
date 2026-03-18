export interface Trade {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  openPrice: number;
  closePrice?: number;
  volume: number;
  pnl?: number;
  openTime: string;
  closeTime?: string;
  commission?: number;
  swap?: number;
  comment?: string;
}
