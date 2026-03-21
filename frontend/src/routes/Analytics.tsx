import { useTranslation } from "react-i18next";

export function Analytics() {
  const { t } = useTranslation();

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">{t("routes.analytics")}</h1>
    </main>
  );
}
