import React, { useState, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  eachDayOfInterval,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Trade } from '../types';
import { motion } from 'motion/react';

interface TradeCalendarProps {
  trades: Trade[];
}

export function TradeCalendar({ trades }: TradeCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Group trades by date string 'yyyy-MM-dd'
  const tradesByDay = useMemo(() => {
    const grouped: Record<string, Trade[]> = {};
    trades.forEach(trade => {
      const dateStr = trade.date.split('T')[0];
      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push(trade);
    });
    return grouped;
  }, [trades]);

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const currentMonthTrades = trades.filter(t => isSameMonth(parseISO(t.date), currentDate));
    const pnl = currentMonthTrades.reduce((sum, t) => sum + t.pnl, 0);
    const daysTraded = new Set(currentMonthTrades.map(t => t.date.split('T')[0])).size;
    return { pnl, daysTraded };
  }, [trades, currentDate]);

  // Group into weeks for the right sidebar
  const weeks = useMemo(() => {
    const weekArray = [];
    let currentWeek = [];
    
    for (let i = 0; i < days.length; i++) {
      currentWeek.push(days[i]);
      if (currentWeek.length === 7) {
        weekArray.push(currentWeek);
        currentWeek = [];
      }
    }
    return weekArray;
  }, [days]);

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000) {
      return `${value < 0 ? '-' : ''}$${(absValue / 1000).toFixed(2)}K`;
    }
    return `${value < 0 ? '-' : ''}$${absValue.toFixed(0)}`;
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-[var(--bg-secondary)] rounded-3xl p-6 border border-[var(--border-color)] shadow-sm transition-shadow hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] w-36 text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button onClick={nextMonth} className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>
          <button 
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80 rounded-lg transition-colors"
          >
            This month
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-sm bg-[var(--bg-tertiary)]/50 px-4 py-2 rounded-xl border border-[var(--border-color)]">
          <span className="text-[var(--text-secondary)] font-medium">Monthly stats:</span>
          <span className={`font-semibold ${monthlyStats.pnl >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
            {monthlyStats.pnl >= 0 ? '+' : ''}{formatCurrency(monthlyStats.pnl)}
          </span>
          <span className="px-2 py-1 bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)] font-medium">
            {monthlyStats.daysTraded} days
          </span>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {/* Calendar Grid */}
        <div className="flex-1 min-w-[700px]">
          {/* Days of week */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-[var(--text-secondary)] py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayTrades = tradesByDay[dateStr] || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              
              const pnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
              const winCount = dayTrades.filter(t => t.pnl > 0).length;
              const winRate = dayTrades.length > 0 ? (winCount / dayTrades.length) * 100 : 0;
              
              let bgClass = "bg-[var(--bg-tertiary)]/30 border-transparent";
              let textClass = "text-[var(--text-secondary)]";
              
              if (dayTrades.length > 0) {
                if (pnl > 0) {
                  bgClass = "bg-emerald-500/10 border-emerald-500/20";
                  textClass = "text-emerald-600 dark:text-emerald-400";
                } else if (pnl < 0) {
                  bgClass = "bg-rose-500/10 border-rose-500/20";
                  textClass = "text-rose-600 dark:text-rose-400";
                } else {
                  bgClass = "bg-blue-500/10 border-blue-500/20";
                  textClass = "text-blue-600 dark:text-blue-400";
                }
              }

              if (!isCurrentMonth) {
                bgClass = "bg-[var(--bg-tertiary)]/10 border-transparent opacity-40";
              }

              return (
                <div 
                  key={day.toString()} 
                  className={`min-h-[110px] p-2 rounded-xl border flex flex-col transition-colors ${bgClass}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    {dayTrades.length > 0 ? (
                      <CalendarIcon className="w-4 h-4 text-[var(--text-secondary)] opacity-50" />
                    ) : (
                      <div />
                    )}
                    <span className={`text-sm font-medium ${isCurrentMonth ? 'text-[var(--text-secondary)]' : 'text-[var(--text-secondary)] opacity-50'}`}>
                      {format(day, 'd')}
                    </span>
                  </div>
                  
                  {dayTrades.length > 0 && (
                    <div className="flex flex-col items-center justify-center flex-1 mt-1">
                      <span className={`font-bold text-base ${textClass}`}>
                        {pnl > 0 ? '+' : ''}{formatCurrency(pnl)}
                      </span>
                      <span className="text-[11px] text-[var(--text-secondary)] mt-1 font-medium">
                        {dayTrades.length} {dayTrades.length === 1 ? 'trade' : 'trades'}
                      </span>
                      <span className="text-[11px] text-[var(--text-secondary)] opacity-70 font-medium">
                        {winRate.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Summary Sidebar */}
        <div className="w-24 flex flex-col pt-[40px] gap-2 shrink-0">
          {weeks.map((week, i) => {
            const weekTrades = week.flatMap(day => tradesByDay[format(day, 'yyyy-MM-dd')] || []);
            const pnl = weekTrades.reduce((sum, t) => sum + t.pnl, 0);
            const daysTraded = new Set(weekTrades.map(t => t.date.split('T')[0])).size;
            
            return (
              <div key={i} className="h-[110px] bg-[var(--bg-tertiary)]/50 rounded-xl border border-[var(--border-color)] p-2 flex flex-col items-center justify-center">
                <span className="text-xs text-[var(--text-secondary)] mb-1 font-medium">Week {i + 1}</span>
                <span className={`text-sm font-bold ${pnl > 0 ? 'text-emerald-600 dark:text-emerald-400' : pnl < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-[var(--text-secondary)]'}`}>
                  {pnl > 0 ? '+' : ''}{formatCurrency(pnl)}
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-[var(--bg-tertiary)] rounded mt-1 text-[var(--text-secondary)] font-medium">
                  {daysTraded} {daysTraded === 1 ? 'day' : 'days'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
