import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { AuthMeResponse } from "@/types/auth";

interface UseAuthMeOptions {
  enabled: boolean;
  userId: string | undefined;
}

export function useAuthMe({ enabled, userId }: UseAuthMeOptions) {
  return useQuery({
    queryKey: ["auth", "me", userId],
    queryFn: () => apiFetch<AuthMeResponse>("/api/v1/auth/me"),
    enabled: enabled && Boolean(userId),
  });
}
