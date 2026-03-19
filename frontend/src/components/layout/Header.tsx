import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/config/routes";

export function Header() {
  const navigate = useNavigate();
  const backendUser = useAuthStore((state) => state.backendUser);
  const supabaseUser = useAuthStore((state) => state.supabaseUser);
  const logout = useAuthStore((state) => state.logout);
  const userEmail = backendUser?.email ?? supabaseUser?.email;

  async function handleLogout() {
    await logout();
    void navigate(ROUTES.LANDING, { replace: true });
  }

  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <span className="text-lg font-bold">Tyche</span>
      <div className="flex items-center gap-3">
        {userEmail && (
          <span className="text-sm text-muted-foreground">{userEmail}</span>
        )}
        <Button variant="outline" size="sm" onClick={() => void handleLogout()}>
          登出
        </Button>
      </div>
    </header>
  );
}
