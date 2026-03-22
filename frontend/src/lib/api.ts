import { useAuthStore } from "@/stores/authStore";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const { headers, ...restOptions } = options ?? {};

  const accessToken = useAuthStore.getState().session?.access_token;
  const requestHeaders = new Headers(headers);
  const isFormDataRequest = restOptions.body instanceof FormData;

  if (!isFormDataRequest && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (accessToken && !requestHeaders.has("Authorization")) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(url, {
    ...restOptions,
    headers: requestHeaders,
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    let message = `API Error: ${res.status} ${res.statusText}`;

    if (contentType.includes("application/json")) {
      const payload = (await res.json()) as {
        detail?: string;
        error?: { message?: string };
      };
      if (payload.detail) {
        message = payload.detail;
      } else if (payload.error?.message) {
        message = payload.error.message;
      }
    } else {
      const text = await res.text();
      if (text) {
        message = text;
      }
    }

    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
