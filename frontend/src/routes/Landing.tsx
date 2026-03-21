import { useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { LandingHero } from "@/components/landing/LandingHero";
import { ROUTES } from "@/config/routes";
import { useAuthStore } from "@/stores/authStore";

const AUTH_STATUS_STORAGE_KEY = "auth-status";

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
  const location = useLocation();
  const navigate = useNavigate();
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
      return "注册链接已过期，请重新注册后再前往邮箱完成验证。";
    }
    return null;
  }, [authStatus]);

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
    <div className="landing-grid min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <LandingHero onLogin={() => setLoginOpen(true)} />
      </main>

      <LoginDialog
        open={loginOpen || Boolean(authMessage)}
        onOpenChange={setLoginOpen}
        authMessage={authMessage}
        onAuthMessageDismiss={clearAuthStatus}
      />
    </div>
  );
}
