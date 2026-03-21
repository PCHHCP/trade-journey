import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useTranslation } from "react-i18next";

interface AccountMenuProps {
  className?: string;
  compact?: boolean;
}

export function AccountMenu({ className, compact = false }: AccountMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const backendUser = useAuthStore((state) => state.backendUser);
  const supabaseUser = useAuthStore((state) => state.supabaseUser);
  const logout = useAuthStore((state) => state.logout);
  const userEmail = backendUser?.email ?? supabaseUser?.email;
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    setMenuOpen(false);

    try {
      await logout();
      void navigate(ROUTES.LANDING, { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <Popover open={menuOpen} onOpenChange={setMenuOpen}>
      <PopoverTrigger
        aria-label={t("common.account.ariaLabel")}
        className={cn(
          "flex items-center gap-3 border border-border/70 bg-background/85 text-left text-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-ring",
          compact
            ? "h-10 w-[240px] rounded-lg px-3"
            : "w-44 rounded-2xl px-3 py-2 sm:w-60",
          menuOpen && "bg-muted/70",
          className,
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {userEmail ?? t("common.account.fallbackName")}
          </p>
          {!compact && (
            <p className="truncate text-xs text-muted-foreground">
              {userEmail
                ? t("common.account.signedIn")
                : t("common.account.openMenu")}
            </p>
          )}
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            menuOpen && "rotate-180",
          )}
        />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className={cn(
          "w-64 gap-2 border border-border/70 bg-popover/95 p-2 shadow-xl backdrop-blur-xl",
          compact ? "rounded-xl" : "rounded-2xl",
        )}
      >
        <div className="rounded-xl px-3 py-2">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {t("common.account.title")}
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-popover-foreground">
            {userEmail ?? t("common.account.signedInUser")}
          </p>
        </div>
        <Separator className="bg-border/80" />
        <Button
          variant="ghost"
          className="h-11 w-full justify-start gap-2 rounded-xl px-3 text-sm font-medium"
          onClick={() => void handleLogout()}
          disabled={isLoggingOut}
        >
          <LogOut className="size-4" />
          {isLoggingOut
            ? t("common.account.loggingOut")
            : t("common.account.logOut")}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
