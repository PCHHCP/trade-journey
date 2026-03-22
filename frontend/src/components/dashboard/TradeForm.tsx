import { useState, type FormEvent } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { DashboardTrade } from "./types";

interface TradeFormProps {
  onClose: () => void;
  onSubmit: (trade: Omit<DashboardTrade, "id">) => void;
}

export function TradeForm({ onClose, onSubmit }: TradeFormProps) {
  const { t } = useTranslation();
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent variant="panel" size="md" className="max-h-[90vh]">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle className="text-lg font-semibold text-foreground">
            {t("dashboard.form.title")}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground">
                {t("dashboard.form.date")}
              </Label>
              <DateTimePicker value={date} onChange={setDate} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground">
                {t("dashboard.form.product")}
              </Label>
              <Input
                type="text"
                required
                placeholder={t("dashboard.form.productPlaceholder")}
                value={formData.product}
                onChange={(e) =>
                  setFormData({ ...formData, product: e.target.value })
                }
                className="h-10 uppercase"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground">
              {t("dashboard.form.type")}
            </Label>
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
                className="relative z-10 flex-1 rounded-md py-2 text-center text-sm font-medium transition-colors"
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
                className="relative z-10 flex-1 rounded-md py-2 text-center text-sm font-medium transition-colors"
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
              <Label className="text-muted-foreground">
                {t("dashboard.form.entryPrice")}
              </Label>
              <Input
                type="number"
                step="0.01"
                required
                min="0"
                placeholder="0.00"
                value={formData.entryPrice}
                onChange={(e) =>
                  setFormData({ ...formData, entryPrice: e.target.value })
                }
                className="h-10 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground">
                {t("dashboard.form.exitPrice")}
              </Label>
              <Input
                type="number"
                step="0.01"
                required
                min="0"
                placeholder="0.00"
                value={formData.exitPrice}
                onChange={(e) =>
                  setFormData({ ...formData, exitPrice: e.target.value })
                }
                className="h-10 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground">
              {t("dashboard.form.lot")}
            </Label>
            <Input
              type="number"
              step="0.01"
              required
              min="0"
              placeholder="1.0"
              value={formData.lot}
              onChange={(e) =>
                setFormData({ ...formData, lot: e.target.value })
              }
              className="h-10 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground">
              {t("dashboard.form.notes")}
            </Label>
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

          <DialogFooter className="mt-auto border-t border-border bg-transparent px-0 pt-4 pb-0">
            <Button type="button" onClick={onClose} variant="outline">
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("dashboard.form.saveTrade")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
