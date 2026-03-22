import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { ImportTradesResponse } from "@/types/trade";

async function importTrades(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<ImportTradesResponse>("/api/v1/trades/import", {
    method: "POST",
    body: formData,
  });
}

export function useImportTrades() {
  return useMutation({
    mutationFn: importTrades,
  });
}
