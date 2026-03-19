import { useState } from "react";
import { Navigate } from "react-router";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { ROUTES } from "@/config/routes";
import { useAuthStore } from "@/stores/authStore";

export function Landing() {
  const session = useAuthStore((state) => state.session);
  const loading = useAuthStore((state) => state.loading);
  const [loginOpen, setLoginOpen] = useState(false);

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

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}
