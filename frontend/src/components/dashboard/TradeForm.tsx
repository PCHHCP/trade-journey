import { useEffect, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { X } from "lucide-react";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import type { DashboardTrade } from "./types";

interface TradeFormProps {
  onClose: () => void;
  onSubmit: (trade: Omit<DashboardTrade, "id">) => void;
}

export function TradeForm({ onClose, onSubmit }: TradeFormProps) {
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
      date: date ? format(date, "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e1f23] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-white/5">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Log New Trade</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto flex-1 flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Date</label>
              <DateTimePicker
                value={date}
                onChange={setDate}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Product
              </label>
              <input
                type="text"
                required
                placeholder="E.G. BTC/USD"
                value={formData.product}
                onChange={(e) =>
                  setFormData({ ...formData, product: e.target.value })
                }
                className="w-full px-3 py-2 border border-white/10 bg-[#16171a] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm uppercase"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Type</label>
            <div className="relative flex rounded-lg border border-white/10 bg-[#16171a] p-1">
              <div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-indigo-600 transition-transform duration-200 ease-in-out"
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
                  color: formData.type === "LONG" ? "#fff" : "#94a3b8",
                }}
              >
                Long
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "SHORT" })}
                className="relative z-10 flex-1 py-2 text-sm font-medium text-center rounded-md transition-colors"
                style={{
                  color: formData.type === "SHORT" ? "#fff" : "#94a3b8",
                }}
              >
                Short
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Entry Price
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
                className="w-full px-3 py-2 border border-white/10 bg-[#16171a] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Exit Price
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
                className="w-full px-3 py-2 border border-white/10 bg-[#16171a] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Lot</label>
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
              className="w-full px-3 py-2 border border-white/10 bg-[#16171a] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">
              Notes (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Why did you take this trade?"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-3 py-2 border border-white/10 bg-[#16171a] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
            />
          </div>

          <div className="pt-4 mt-auto border-t border-white/5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-transparent border border-white/10 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1e1f23] focus:ring-indigo-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1e1f23] focus:ring-indigo-500 transition-colors shadow-sm"
            >
              Save Trade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
