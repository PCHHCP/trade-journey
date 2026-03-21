import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Trade } from '../types';
import { X } from 'lucide-react';
import { useTheme } from './ThemeContext';

interface TradeFormProps {
  onClose: () => void;
  onSubmit: (trade: Omit<Trade, 'id'>) => void;
}

export function TradeForm({ onClose, onSubmit }: TradeFormProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
    return {
      date: localISOTime,
      asset: '',
      type: 'LONG' as 'LONG' | 'SHORT',
      entryPrice: '',
      exitPrice: '',
      quantity: '',
      notes: '',
    };
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const entryPrice = Math.round(parseFloat(formData.entryPrice) * 100) / 100;
    const exitPrice = Math.round(parseFloat(formData.exitPrice) * 100) / 100;
    const quantity = Math.round(parseFloat(formData.quantity) * 100) / 100;
    
    // Calculate PnL based on type
    let pnl = 0;
    if (formData.type === 'LONG') {
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        className="bg-[var(--bg-secondary)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-[var(--border-color)]"
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Log New Trade</h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Date</label>
              <input
                type="datetime-local"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm ${theme === 'dark' ? '[color-scheme:dark]' : ''}`}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Product</label>
              <input
                type="text"
                required
                placeholder="e.g. BTC/USD"
                value={formData.asset}
                onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm uppercase"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Type</label>
            <div className="relative flex items-center p-1 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg">
              <div
                className={`absolute inset-y-1 w-[calc(50%-4px)] bg-indigo-600 rounded-md transition-transform duration-200 ease-in-out ${
                  formData.type === 'SHORT' ? 'translate-x-full' : 'translate-x-0'
                }`}
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'LONG' })}
                className={`relative flex-1 py-1.5 text-sm font-medium transition-colors ${
                  formData.type === 'LONG' ? 'text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Long
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'SHORT' })}
                className={`relative flex-1 py-1.5 text-sm font-medium transition-colors ${
                  formData.type === 'SHORT' ? 'text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Short
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Entry Price</label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                placeholder="0.00"
                value={formData.entryPrice}
                onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Exit Price</label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                placeholder="0.00"
                value={formData.exitPrice}
                onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Lot</label>
            <input
              type="number"
              step="0.01"
              required
              min="0"
              placeholder="1.0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Notes (Optional)</label>
            <textarea
              rows={3}
              placeholder="Why did you take this trade?"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
            />
          </div>

          <div className="pt-4 mt-auto border-t border-[var(--border-color)] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-transparent border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-tertiary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-indigo-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-indigo-500 transition-colors shadow-sm"
            >
              Save Trade
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
