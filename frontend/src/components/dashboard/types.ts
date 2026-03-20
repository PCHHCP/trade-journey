export interface DashboardTrade {
  id: string;
  date: string;
  asset: string;
  type: "LONG" | "SHORT";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  notes?: string;
}

export interface TradeStats {
  totalTrades: number;
  winRate: number;
  totalPnl: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
}
