import { useTranslation } from "react-i18next";

export function TradeList() {
  const { t } = useTranslation();

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">{t("routes.tradeList")}</h1>
    </main>
  );
}
