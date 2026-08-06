import React from 'react';
import { TransactionItem, CurrencyConfig } from '../types';
import { PieChart, Tag } from 'lucide-react';
import { formatCurrencyAmount } from '../utils/currency';

interface CategoryChartProps {
  transactions: TransactionItem[];
  currency: CurrencyConfig;
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ transactions, currency }) => {
  // Calculate spending per category (only negative amounts)
  const expenseTx = transactions.filter(t => t.amount < 0);
  const totalExpense = expenseTx.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  if (totalExpense === 0) return null;

  const categoryTotals: Record<string, number> = {};
  for (const t of expenseTx) {
    const cat = (t.category || 'other').toLowerCase();
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(t.amount);
  }

  const sortedCategories = Object.entries(categoryTotals)
    .map(([cat, total]) => ({
      category: cat,
      total,
      percentage: (total / totalExpense) * 100
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <PieChart className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Expense Categories</h3>
        </div>
        <span className="text-xs font-bold text-slate-600 font-mono">
          {formatCurrencyAmount(totalExpense, currency.symbol, false)} Total
        </span>
      </div>

      {/* Category Horizontal Bars */}
      <div className="space-y-3">
        {sortedCategories.slice(0, 7).map(({ category, total, percentage }) => (
          <div key={category} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="capitalize text-slate-700 flex items-center gap-1.5 font-bold">
                <Tag className="w-3 h-3 text-slate-400" /> {category}
              </span>
              <span className="text-slate-600 font-mono text-[11px]">
                {formatCurrencyAmount(total, currency.symbol, false)} ({percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  category === 'groceries' ? 'bg-indigo-500' :
                  category === 'bills' || category === 'utility' ? 'bg-rose-500' :
                  category === 'fuel' ? 'bg-amber-500' :
                  category === 'transport' ? 'bg-purple-500' :
                  category === 'food' ? 'bg-orange-500' :
                  category === 'shopping' ? 'bg-emerald-500' :
                  category === 'software' || category === 'subscription' ? 'bg-teal-500' :
                  'bg-slate-500'
                }`}
                style={{ width: `${Math.max(percentage, 3)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
