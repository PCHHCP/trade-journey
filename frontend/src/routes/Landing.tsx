import { useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/auth/LoginDialog";
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
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-lg font-bold">Tyche</span>
        <Button variant="outline" onClick={() => setLoginOpen(true)}>
          登录
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Tyche</h1>
        <p className="max-w-md text-center text-lg text-muted-foreground">
          记录并分析你的每一笔交易，助你成为更好的交易者。
        </p>
        <Button size="lg" className="mt-4" onClick={() => setLoginOpen(true)}>
          开始使用
        </Button>
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
