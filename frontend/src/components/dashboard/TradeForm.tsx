import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { DashboardTrade } from "./types";

interface TradeFormProps {
  onClose: () => void;
  onSubmit: (trade: Omit<DashboardTrade, "id">) => void;
}

export function TradeForm({ onClose, onSubmit }: TradeFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    asset: "",
    type: "LONG" as "LONG" | "SHORT",
    entryPrice: "",
    exitPrice: "",
    quantity: "",
    notes: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const entryPrice = parseFloat(formData.entryPrice);
    const exitPrice = parseFloat(formData.exitPrice);
    const quantity = parseFloat(formData.quantity);

    let pnl = 0;
    if (formData.type === "LONG") {
      pnl = (exitPrice - entryPrice) * quantity;
    } else {
      pnl = (entryPrice - exitPrice) * quantity;
    }

    onSubmit({
      date: formData.date,
      asset: formData.asset.toUpperCase(),
      type: formData.type,
      entryPrice,
      exitPrice,
      quantity,
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
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-3 py-2 border border-white/10 bg-[#16171a] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Asset/Pair
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BTC/USD"
                value={formData.asset}
                onChange={(e) =>
                  setFormData({ ...formData, asset: e.target.value })
                }
                className="w-full px-3 py-2 border border-white/10 bg-[#16171a] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm uppercase"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="LONG"
                  checked={formData.type === "LONG"}
                  onChange={() => setFormData({ ...formData, type: "LONG" })}
                  className="text-indigo-600 focus:ring-indigo-500 bg-[#16171a] border-white/10"
                />
                <span className="text-sm text-slate-300">Long</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="SHORT"
                  checked={formData.type === "SHORT"}
                  onChange={() => setFormData({ ...formData, type: "SHORT" })}
                  className="text-indigo-600 focus:ring-indigo-500 bg-[#16171a] border-white/10"
                />
                <span className="text-sm text-slate-300">Short</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Entry Price
              </label>
              <input
                type="number"
                step="any"
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
                step="any"
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
            <label className="text-sm font-medium text-slate-300">
              Quantity
            </label>
            <input
              type="number"
              step="any"
              required
              min="0"
              placeholder="1.0"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
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
