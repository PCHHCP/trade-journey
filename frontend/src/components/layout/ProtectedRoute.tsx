import { Navigate } from "react-router";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/config/routes";
import { Header } from "@/components/layout/Header";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface ProtectedRouteProps {
  children: ReactNode;
  hideHeader?: boolean;
}

export function ProtectedRoute({ children, hideHeader }: ProtectedRouteProps) {
  const { t } = useTranslation();
  const session = useAuthStore((state) => state.session);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to={ROUTES.LANDING} replace />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {!hideHeader && <Header />}
      {children}
    </div>
  );
}
