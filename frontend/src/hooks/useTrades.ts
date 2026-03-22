import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { TradeListResponse } from "@/types/trade";

interface UseTradesOptions {
  accountId?: string;
  limit?: number;
  offset?: number;
}

export function useTrades({
  accountId,
  limit = 50,
  offset = 0,
}: UseTradesOptions = {}) {
  const params = new URLSearchParams();
  if (accountId) params.set("account_id", accountId);
  params.set("limit", String(limit));
  params.set("offset", String(offset));

  const queryString = params.toString();

  return useQuery({
    queryKey: ["trades", accountId, limit, offset],
    queryFn: () => apiFetch<TradeListResponse>(`/api/v1/trades?${queryString}`),
  });
}
