import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ROUTES } from "@/config/routes";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { Landing } from "@/routes/Landing";
import { AuthCallback } from "@/routes/AuthCallback";
import { Dashboard } from "@/routes/Dashboard";
import { TradeList } from "@/routes/TradeList";
import { TradeDetail } from "@/routes/TradeDetail";
import { Import } from "@/routes/Import";
import { Analytics } from "@/routes/Analytics";
import { AppErrorBoundary } from "@/components/layout/AppErrorBoundary";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

const queryClient = new QueryClient();

function AuthListener({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((state) => state.setSession);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession, setLoading]);

  return <>{children}</>;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppErrorBoundary>
        <BrowserRouter>
          <AuthListener>
            <Routes>
              <Route path={ROUTES.LANDING} element={<Landing />} />
              <Route path={ROUTES.AUTH_CALLBACK} element={<AuthCallback />} />
              <Route
                path={ROUTES.DASHBOARD}
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.TRADES}
                element={
                  <ProtectedRoute>
                    <TradeList />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.TRADE_DETAIL}
                element={
                  <ProtectedRoute>
                    <TradeDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.IMPORT}
                element={
                  <ProtectedRoute>
                    <Import />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ANALYTICS}
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthListener>
        </BrowserRouter>
      </AppErrorBoundary>
    </QueryClientProvider>
  );
}
