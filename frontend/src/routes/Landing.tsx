import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Navigate, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { LandingHero } from "@/components/landing/LandingHero";
import { useDelayedResolvedTheme } from "@/hooks/useDelayedResolvedTheme";
import { ROUTES } from "@/config/routes";
import { useAuthStore } from "@/stores/authStore";

const AUTH_STATUS_STORAGE_KEY = "auth-status";
const LANDING_BACKGROUND_DELAY_MS = 300;

function readPersistedAuthStatus() {
  try {
    return window.sessionStorage.getItem(AUTH_STATUS_STORAGE_KEY);
  } catch {
    return null;
  }
}

function clearPersistedAuthStatus() {
  try {
    window.sessionStorage.removeItem(AUTH_STATUS_STORAGE_KEY);
  } catch {
    // Ignore storage failures during cleanup.
  }
}

export function Landing() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const backgroundTheme = useDelayedResolvedTheme(LANDING_BACKGROUND_DELAY_MS);
  const session = useAuthStore((state) => state.session);
  const loading = useAuthStore((state) => state.loading);
  const [loginOpen, setLoginOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState<string | null>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const statusFromUrl = searchParams.get("auth_status");

    if (statusFromUrl) {
      try {
        window.sessionStorage.setItem(AUTH_STATUS_STORAGE_KEY, statusFromUrl);
      } catch {
        // Ignore storage failures and continue with local state.
      }
      return statusFromUrl;
    }

    return readPersistedAuthStatus();
  });
  const authMessage = useMemo(() => {
    if (authStatus === "expired") {
      return t("auth.authExpired");
    }
    return null;
  }, [authStatus, t]);

  function clearAuthStatus() {
    if (!authStatus) {
      return;
    }

    clearPersistedAuthStatus();
    setAuthStatus(null);

    const searchParams = new URLSearchParams(location.search);
    searchParams.delete("auth_status");
    if (searchParams.toString() !== location.search.replace(/^\?/, "")) {
      void navigate(
        {
          pathname: ROUTES.LANDING,
          search: searchParams.toString() ? `?${searchParams.toString()}` : "",
        },
        { replace: true },
      );
    }
  }

  if (!loading && session) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <motion.div
      className="landing-grid min-h-screen"
      animate={{
        backgroundColor:
          backgroundTheme === "dark"
            ? "oklch(0.10 0.015 270)"
            : "oklch(0.96 0.008 270)",
        backgroundImage:
          backgroundTheme === "dark"
            ? "radial-gradient(oklch(0.24 0.015 270) 1.5px, transparent 1.5px)"
            : "radial-gradient(oklch(0.82 0.01 270) 1.5px, transparent 1.5px)",
      }}
      transition={{ duration: 0.5 }}
    >
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <LandingHero onLogin={() => setLoginOpen(true)} />
      </main>

      <LoginDialog
        open={loginOpen || Boolean(authMessage)}
        onOpenChange={setLoginOpen}
        authMessage={authMessage}
        onAuthMessageDismiss={clearAuthStatus}
      />
    </motion.div>
  );
}
