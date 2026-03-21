import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { useTranslation } from "react-i18next";

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between border-b border-border/70 bg-background/85 px-6 py-4 backdrop-blur-sm">
      <span className="text-lg font-bold text-foreground">
        {t("common.brand")}
      </span>
      <div className="flex items-center gap-3">
        <LanguageToggle />
        <ThemeToggle />
        <AccountMenu />
      </div>
    </header>
  );
}
