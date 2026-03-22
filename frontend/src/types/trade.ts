export interface TradeResponse {
  id: string;
  user_id: string;
  account_id: string;
  ticket: number;
  symbol: string;
  type: string;
  volume: number;
  open_price: number;
  stop_loss: number | null;
  take_profit: number | null;
  open_time: string;
  close_time: string;
  close_price: number;
  commission: number;
  swap: number;
  profit: number;
  created_at: string;
  updated_at: string;
}

export interface TradeListResponse {
  trades: TradeResponse[];
  total: number;
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
