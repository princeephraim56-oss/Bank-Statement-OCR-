import React from 'react';
import { TransactionItem } from '../types';
import { PieChart, Tag } from 'lucide-react';

interface CategoryChartProps {
  transactions: TransactionItem[];
}

const CATEGORY_COLORS: Record<string, string> = {
  groceries: 'bg-emerald-500 text-emerald-700 border-emerald-200',
  food: 'bg-amber-500 text-amber-700 border-amber-200',
  fuel: 'bg-orange-500 text-orange-700 border-orange-200',
  transport: 'bg-blue-500 text-blue-700 border-blue-200',
  bills: 'bg-rose-500 text-rose-700 border-rose-200',
  gifts: 'bg-purple-500 text-purple-700 border-purple-200',
  shopping: 'bg-indigo-500 text-indigo-700 border-indigo-200',
  salary: 'bg-teal-500 text-teal-700 border-teal-200',
  income: 'bg-emerald-600 text-emerald-800 border-emerald-300',
  transfer: 'bg-cyan-500 text-cyan-700 border-cyan-200',
  utility: 'bg-rose-400 text-rose-700 border-rose-200',
  entertainment: 'bg-pink-500 text-pink-700 border-pink-200',
  healthcare: 'bg-sky-500 text-sky-700 border-sky-200',
  software: 'bg-violet-500 text-violet-700 border-violet-200',
  subscription: 'bg-fuchsia-500 text-fuchsia-700 border-fuchsia-200',
  fees: 'bg-red-500 text-red-700 border-red-200',
  other: 'bg-slate-400 text-slate-700 border-slate-200'
};

export const CategoryChart: React.FC<CategoryChartProps> = ({ transactions }) => {
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
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <PieChart className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Auto-Detected Expense Categories</h3>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          ${totalExpense.toFixed(2)} Total Expenses
        </span>
      </div>

      {/* Category Horizontal Bars */}
      <div className="space-y-3">
        {sortedCategories.slice(0, 6).map(({ category, total, percentage }) => (
          <div key={category} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="capitalize text-slate-700 flex items-center gap-1.5 font-bold">
                <Tag className="w-3 h-3 text-slate-400" /> {category}
              </span>
              <span className="text-slate-600 font-mono">
                ${total.toFixed(2)} ({percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  category === 'groceries' ? 'bg-emerald-500' :
                  category === 'bills' || category === 'utility' ? 'bg-rose-500' :
                  category === 'fuel' ? 'bg-orange-500' :
                  category === 'transport' ? 'bg-blue-500' :
                  category === 'food' ? 'bg-amber-500' :
                  category === 'shopping' ? 'bg-indigo-500' :
                  category === 'software' || category === 'subscription' ? 'bg-violet-500' :
                  'bg-slate-500'
                }`}
                style={{ width: `${Math.max(percentage, 2)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
