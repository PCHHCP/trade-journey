import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { subDays, startOfMonth, startOfYear, parseISO, startOfDay, endOfDay } from 'date-fns';
import { initialTrades } from './data/mockData';
import { Trade, TradeStats } from './types';
import { DashboardCharts } from './components/DashboardCharts';
import { TradeList } from './components/TradeList';
import { TradeForm } from './components/TradeForm';
import { TradeCalendar } from './components/TradeCalendar';
import { formatCurrency, formatPercentage } from './lib/utils';
import { 
  Activity, 
  Target, 
  Plus, 
  LineChart,
  Wallet,
  Calendar,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from './components/ThemeContext';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const filteredTrades = useMemo(() => {
    const now = new Date();
    return trades.filter(trade => {
      const tradeDate = parseISO(trade.date);
      if (dateFilter === '7d') return tradeDate >= startOfDay(subDays(now, 7));
      if (dateFilter === '30d') return tradeDate >= startOfDay(subDays(now, 30));
      if (dateFilter === 'month') return tradeDate >= startOfMonth(now);
      if (dateFilter === 'year') return tradeDate >= startOfYear(now);
      if (dateFilter === 'custom') {
        const start = customStartDate ? startOfDay(parseISO(customStartDate)) : new Date(0);
        const end = customEndDate ? endOfDay(parseISO(customEndDate)) : new Date(8640000000000000);
        return tradeDate >= start && tradeDate <= end;
      }
      return true;
    });
  }, [trades, dateFilter, customStartDate, customEndDate]);

  const stats = useMemo<TradeStats>(() => {
    if (filteredTrades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        totalPnl: 0,
        profitFactor: 0,
        averageWin: 0,
        averageLoss: 0,
        largestWin: 0,
        largestLoss: 0,
      };
    }

    const wins = filteredTrades.filter(t => t.pnl > 0);
    const losses = filteredTrades.filter(t => t.pnl <= 0);
    
    const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
    const totalPnl = grossProfit - grossLoss;
    
    const winRate = (wins.length / filteredTrades.length) * 100;
    const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
    
    const averageWin = wins.length > 0 ? grossProfit / wins.length : 0;
    const averageLoss = losses.length > 0 ? grossLoss / losses.length : 0;
    
    const largestWin = wins.length > 0 ? Math.max(...wins.map(t => t.pnl)) : 0;
    const largestLoss = losses.length > 0 ? Math.min(...losses.map(t => t.pnl)) : 0;

    return {
      totalTrades: filteredTrades.length,
      winRate,
      totalPnl,
      profitFactor,
      averageWin,
      averageLoss,
      largestWin,
      largestLoss,
    };
  }, [filteredTrades]);

  const handleAddTrade = (newTrade: Omit<Trade, 'id'>) => {
    const trade: Trade = {
      ...newTrade,
      id: Math.random().toString(36).substr(2, 9),
    };
    setTrades([...trades, trade]);
    setIsFormOpen(false);
  };

  const handleDeleteTrade = (id: string) => {
    if (window.confirm('Are you sure you want to delete this trade?')) {
      setTrades(trades.filter(t => t.id !== id));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] bg-dot-pattern flex flex-col">
      {/* Header */}
      <header className="bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-color)] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <LineChart className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">Tyche仪表盘</h1>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shadow-sm"
              aria-label="Toggle theme"
            >
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </motion.div>
            </motion.button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Log Trade
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Filter Bar */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Dashboard Overview</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-color)] shadow-sm">
              {[
                { id: 'all', label: 'All' },
                { id: '7d', label: '7D' },
                { id: '30d', label: '30D' },
                { id: 'month', label: 'Month' },
                { id: 'year', label: 'Year' },
                { id: 'custom', label: 'Custom' }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setDateFilter(filter.id)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    dateFilter === filter.id 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            
            {dateFilter === 'custom' && (
              <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 shadow-sm">
                <Calendar className="w-4 h-4 text-[var(--text-secondary)]" />
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className={`bg-transparent text-sm text-[var(--text-primary)] focus:outline-none ${theme === 'dark' ? '[color-scheme:dark]' : ''}`}
                />
                <span className="text-[var(--text-secondary)] opacity-50">-</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className={`bg-transparent text-sm text-[var(--text-primary)] focus:outline-none ${theme === 'dark' ? '[color-scheme:dark]' : ''}`}
                />
              </div>
            )}
          </div>
          </motion.div>

          {/* Bento Grid Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Hero P&L */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="md:col-span-2 bg-[var(--bg-secondary)] rounded-3xl p-8 border border-[var(--border-color)] relative overflow-hidden flex flex-col justify-center min-h-[260px] shadow-sm group transition-shadow hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
            >
              <div className={`absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[100px] opacity-10 dark:opacity-20 transition-colors duration-500 ${stats.totalPnl >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center border border-[var(--border-color)]">
                  <Wallet className="w-5 h-5 text-[var(--text-secondary)]" />
                </div>
                <h3 className="text-[var(--text-secondary)] font-medium text-lg">Net P&L</h3>
              </div>
              <div className={`text-6xl md:text-7xl font-bold tracking-tight ${stats.totalPnl >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                {stats.totalPnl >= 0 ? '+' : ''}{formatCurrency(stats.totalPnl)}
              </div>
            </div>
            </motion.div>

            {/* Win Rate & Profit Factor */}
            <motion.div variants={itemVariants} className="md:col-span-1 flex flex-col gap-6">
              <motion.div whileHover={{ y: -4 }} className="bg-[var(--bg-secondary)] rounded-3xl p-6 border border-[var(--border-color)] flex-1 flex flex-col justify-center shadow-sm relative overflow-hidden transition-shadow hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
                <h3 className="text-[var(--text-secondary)] font-medium mb-3 flex items-center gap-2 relative z-10">
                  <Target className="w-4 h-4"/> Win Rate
                </h3>
                <div className="text-4xl font-bold text-[var(--text-primary)] mb-4 relative z-10">{formatPercentage(stats.winRate)}</div>
                <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden relative z-10">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${stats.winRate}%` }} />
                </div>
              </motion.div>
              <motion.div whileHover={{ y: -4 }} className="bg-[var(--bg-secondary)] rounded-3xl p-6 border border-[var(--border-color)] flex-1 flex flex-col justify-center shadow-sm transition-shadow hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20">
                <h3 className="text-[var(--text-secondary)] font-medium mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4"/> Profit Factor
                </h3>
                <div className="text-4xl font-bold text-[var(--text-primary)]">{stats.profitFactor.toFixed(2)}</div>
              </motion.div>
            </motion.div>

            {/* Trade Analysis */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="md:col-span-1 bg-[var(--bg-secondary)] rounded-3xl p-6 border border-[var(--border-color)] flex flex-col justify-between shadow-sm transition-shadow hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
            >
              <h3 className="text-[var(--text-secondary)] font-medium mb-6">Trade Analysis</h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-secondary)]">Total Trades</span>
                <span className="font-semibold text-[var(--text-primary)] text-lg">{stats.totalTrades}</span>
              </div>
              <div className="w-full h-px bg-[var(--border-color)]" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-secondary)]">Avg Win</span>
                <span className="font-semibold text-emerald-500 dark:text-emerald-400">+{formatCurrency(stats.averageWin)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-secondary)]">Avg Loss</span>
                <span className="font-semibold text-rose-500 dark:text-rose-400">-{formatCurrency(stats.averageLoss)}</span>
              </div>
              <div className="w-full h-px bg-[var(--border-color)]" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-secondary)]">Largest Win</span>
                <span className="font-medium text-emerald-500/80 dark:text-emerald-400/80">+{formatCurrency(stats.largestWin)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-secondary)]">Largest Loss</span>
                <span className="font-medium text-rose-500/80 dark:text-rose-400/80">-{formatCurrency(stats.largestLoss)}</span>
              </div>
            </div>
            </motion.div>
          </div>

          {/* Charts */}
          <motion.div variants={itemVariants} className="mb-8">
            <DashboardCharts trades={filteredTrades} />
          </motion.div>

          {/* Calendar */}
          <motion.div variants={itemVariants} className="mb-8">
            <TradeCalendar trades={filteredTrades} />
          </motion.div>

          {/* Trade List */}
          <motion.div variants={itemVariants}>
            <TradeList trades={filteredTrades} onDelete={handleDeleteTrade} />
          </motion.div>
        </motion.div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isFormOpen && (
          <TradeForm
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleAddTrade}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
