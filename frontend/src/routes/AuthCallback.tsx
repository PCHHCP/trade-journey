import { useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { ROUTES } from "@/config/routes";

export function AuthCallback() {
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

      if (!code) {
        void navigate(ROUTES.LANDING, { replace: true });
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        void navigate(ROUTES.LANDING, { replace: true });
        return;
      }

      void navigate(ROUTES.DASHBOARD, { replace: true });
    }

    void resolveAuthCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">正在登录...</p>
    </div>
  );
}
