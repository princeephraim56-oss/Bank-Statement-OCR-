import React from 'react';
import { TransactionItem, StatementMetadata, CurrencyConfig, ProcessedFileItem } from '../types';
import { ArrowUpRight, ArrowDownLeft, Building2, Calendar, ShieldCheck, Files, Layers } from 'lucide-react';
import { formatCurrencyAmount } from '../utils/currency';
import { extractTransactionYear } from '../utils/csv';

interface SummaryCardsProps {
  transactions: TransactionItem[];
  metadata: StatementMetadata;
  fileName?: string;
  files?: ProcessedFileItem[];
  years?: number[];
  currency: CurrencyConfig;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  transactions,
  metadata,
  fileName,
  files = [],
  years = [],
  currency
}) => {
  const totalCount = transactions.length;

  const totalDeposits = transactions
    .filter(t => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const netFlow = totalDeposits - totalExpenses;

  // Calculate year breakdown
  const yearCounts = React.useMemo(() => {
    const counts: Record<number, number> = {};
    for (const t of transactions) {
      const yr = extractTransactionYear(t);
      counts[yr] = (counts[yr] || 0) + 1;
    }
    return Object.entries(counts).sort(([a], [b]) => Number(b) - Number(a));
  }, [transactions]);

  const fileCount = files && files.length > 0 ? files.length : (fileName?.includes('Files') ? 3 : 1);

  return (
    <div className="space-y-4">
      
      {/* Statement Header Info Bar */}
      <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h3 className="font-bold text-sm sm:text-base text-white">
                {metadata.bankName || 'Bank Statement Data'}
              </h3>
              {metadata.accountNumberMasked && (
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono border border-slate-700">
                  {metadata.accountNumberMasked}
                </span>
              )}
              <span className="text-[11px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-800">
                {currency.code} ({currency.symbol})
              </span>
              {fileCount > 1 && (
                <span className="text-[11px] bg-blue-950 text-blue-300 font-semibold px-2 py-0.5 rounded border border-blue-800 flex items-center gap-1">
                  <Files className="w-3 h-3" /> {fileCount} Statements Batch
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{metadata.statementPeriod || 'Statement Period Extracted'}</span>
              {metadata.accountHolder && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300 font-medium">{metadata.accountHolder}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 text-xs flex-wrap gap-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> OCR Verified
          </span>
          {fileName && (
            <span className="text-slate-300 font-mono text-[11px] truncate max-w-xs bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-lg">
              {fileName}
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Extracted & Year Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Transactions</span>
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {totalCount} <span className="text-xs font-medium text-slate-500">rows</span>
          </div>
          {yearCounts.length > 1 ? (
            <div className="flex flex-wrap gap-1 text-[10px]">
              {yearCounts.map(([yr, cnt]) => (
                <span key={yr} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                  {yr}: <strong>{cnt}</strong>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">Single consolidated dataset</p>
          )}
        </div>

        {/* Net Flow */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Net Statement Flow</span>
            <div className={`p-1.5 rounded-lg ${netFlow >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <span className="font-bold text-sm">{currency.symbol}</span>
            </div>
          </div>
          <div className={`text-2xl font-extrabold tracking-tight ${netFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrencyAmount(netFlow, currency.symbol, true)}
          </div>
          <p className="text-[11px] text-slate-400">Total Deposits minus Expenses</p>
        </div>

        {/* Total Deposits */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Deposits (+)</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 tracking-tight">
            +{formatCurrencyAmount(totalDeposits, currency.symbol, false)}
          </div>
          <p className="text-[11px] text-emerald-700/90 font-medium">Salary, credits & incoming transfers</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Expenses (-)</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 tracking-tight">
            -{formatCurrencyAmount(totalExpenses, currency.symbol, false)}
          </div>
          <p className="text-[11px] text-rose-700/90 font-medium">Debits, purchases & bill payments</p>
        </div>

      </div>
    </div>
  );
};
