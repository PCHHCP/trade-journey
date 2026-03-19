import { Navigate } from "react-router";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/config/routes";
import { Header } from "@/components/layout/Header";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const session = useAuthStore((state) => state.session);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to={ROUTES.LANDING} replace />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {children}
    </div>
  );
}
