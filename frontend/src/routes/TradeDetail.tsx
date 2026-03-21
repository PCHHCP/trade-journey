import { useParams } from "react-router";
import { useTranslation } from "react-i18next";

export function TradeDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">
        {t("routes.tradeDetail", { id: id ?? "--" })}
      </h1>
    </main>
  );
}
