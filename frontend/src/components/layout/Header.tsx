import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/config/routes";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

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
    <header className="flex items-center justify-between border-b border-border/70 bg-background/85 px-6 py-4 backdrop-blur-sm">
      <span className="text-lg font-bold text-foreground">Tyche</span>
      <div className="flex items-center gap-3">
        <ThemeToggle />
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
