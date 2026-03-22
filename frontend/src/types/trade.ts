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

export interface TradingAccountResponse {
  id: string;
  user_id: string;
  account_name: string;
  account_number: string;
  platform: string;
  company: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImportTradesResponse {
  imported: number;
  skipped: number;
  account: TradingAccountResponse;
}
