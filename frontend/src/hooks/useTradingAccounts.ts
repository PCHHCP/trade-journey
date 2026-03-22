import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { TradingAccountResponse } from "@/types/trade";

export function useTradingAccounts() {
  return useQuery({
    queryKey: ["trades", "accounts"],
    queryFn: () =>
      apiFetch<TradingAccountResponse[]>("/api/v1/trades/accounts"),
  });
}
