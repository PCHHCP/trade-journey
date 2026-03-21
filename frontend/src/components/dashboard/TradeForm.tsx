import { useEffect, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import type { DashboardTrade } from "./types";

interface TradeFormProps {
  onClose: () => void;
  onSubmit: (trade: Omit<DashboardTrade, "id">) => void;
}

export function TradeForm({ onClose, onSubmit }: TradeFormProps) {
  const { t } = useTranslation();
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState({
    product: "",
    type: "LONG" as "LONG" | "SHORT",
    entryPrice: "",
    exitPrice: "",
    lot: "",
    notes: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const entryPrice = parseFloat(formData.entryPrice);
    const exitPrice = parseFloat(formData.exitPrice);
    const lot = parseFloat(formData.lot);

    let pnl = 0;
    if (formData.type === "LONG") {
      pnl = (exitPrice - entryPrice) * lot;
    } else {
      pnl = (entryPrice - exitPrice) * lot;
    }

    onSubmit({
      date: date
        ? format(date, "yyyy-MM-dd'T'HH:mm")
        : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      product: formData.product.toUpperCase(),
      type: formData.type,
      entryPrice,
      exitPrice,
      lot,
      pnl,
      notes: formData.notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="text-lg font-semibold text-foreground">
            {t("dashboard.form.title")}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto p-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                {t("dashboard.form.date")}
              </label>
              <DateTimePicker value={date} onChange={setDate} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                {t("dashboard.form.product")}
              </label>
              <input
                type="text"
                required
                placeholder={t("dashboard.form.productPlaceholder")}
                value={formData.product}
                onChange={(e) =>
                  setFormData({ ...formData, product: e.target.value })
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground uppercase focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              {t("dashboard.form.type")}
            </label>
            <div className="relative flex rounded-lg border border-input bg-background p-1">
              <div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-primary transition-transform duration-200 ease-in-out"
                style={{
                  transform:
                    formData.type === "SHORT"
                      ? "translateX(calc(100% + 8px))"
                      : "translateX(0)",
                }}
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "LONG" })}
                className="relative z-10 flex-1 py-2 text-sm font-medium text-center rounded-md transition-colors"
                style={{
                  color:
                    formData.type === "LONG"
                      ? "var(--primary-foreground)"
                      : "var(--muted-foreground)",
                }}
              >
                {t("dashboard.tradeTypes.LONG")}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "SHORT" })}
                className="relative z-10 flex-1 py-2 text-sm font-medium text-center rounded-md transition-colors"
                style={{
                  color:
                    formData.type === "SHORT"
                      ? "var(--primary-foreground)"
                      : "var(--muted-foreground)",
                }}
              >
                {t("dashboard.tradeTypes.SHORT")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                {t("dashboard.form.entryPrice")}
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                placeholder="0.00"
                value={formData.entryPrice}
                onChange={(e) =>
                  setFormData({ ...formData, entryPrice: e.target.value })
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                {t("dashboard.form.exitPrice")}
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                placeholder="0.00"
                value={formData.exitPrice}
                onChange={(e) =>
                  setFormData({ ...formData, exitPrice: e.target.value })
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              {t("dashboard.form.lot")}
            </label>
            <input
              type="number"
              step="0.01"
              required
              min="0"
              placeholder="1.0"
              value={formData.lot}
              onChange={(e) =>
                setFormData({ ...formData, lot: e.target.value })
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              {t("dashboard.form.notes")}
            </label>
            <textarea
              rows={3}
              placeholder={t("dashboard.form.notesPlaceholder")}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="mt-auto flex justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="rounded-lg border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card"
            >
              {t("dashboard.form.saveTrade")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
