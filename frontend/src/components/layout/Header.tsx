import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { AccountMenu } from "@/components/layout/AccountMenu";

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-border/70 bg-background/85 px-6 py-4 backdrop-blur-sm">
      <span className="text-lg font-bold text-foreground">Tyche</span>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <AccountMenu />
      </div>
    </header>
  );
}
