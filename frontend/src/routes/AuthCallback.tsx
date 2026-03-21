import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { ROUTES } from "@/config/routes";

const AUTH_STATUS_STORAGE_KEY = "auth-status";

function getAuthCallbackStatus() {
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const errorCode =
    searchParams.get("error_code") ?? hashParams.get("error_code");
  const errorDescription = (
    searchParams.get("error_description") ??
    hashParams.get("error_description") ??
    ""
  ).toLowerCase();

  if (errorCode === "otp_expired" || errorDescription.includes("expired")) {
    return "expired";
  }

  return null;
}

function persistAuthStatus(status: string) {
  try {
    window.sessionStorage.setItem(AUTH_STATUS_STORAGE_KEY, status);
  } catch {
    // Ignore storage failures and fall back to navigation only.
  }
}

export function AuthCallback() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    async function resolveAuthCallback() {
      if (!supabase) {
        void navigate(ROUTES.LANDING, { replace: true });
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        void navigate(ROUTES.DASHBOARD, { replace: true });
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const authStatus = getAuthCallbackStatus();

      if (authStatus) {
        persistAuthStatus(authStatus);
        void navigate(ROUTES.LANDING, { replace: true });
        return;
      }

      if (!code) {
        void navigate(ROUTES.LANDING, { replace: true });
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        if (
          error.code === "otp_expired" ||
          error.message.toLowerCase().includes("expired")
        ) {
          persistAuthStatus("expired");
          void navigate(ROUTES.LANDING, { replace: true });
          return;
        }
        void navigate(ROUTES.LANDING, { replace: true });
        return;
      }

      void navigate(ROUTES.DASHBOARD, { replace: true });
    }

    void resolveAuthCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">{t("auth.callbackLoading")}</p>
    </div>
  );
}
