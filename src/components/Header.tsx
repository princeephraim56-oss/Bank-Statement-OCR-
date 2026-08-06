import React from 'react';
import { FileSpreadsheet, Code2, Sparkles, Layers, RefreshCw, HelpCircle, Coins } from 'lucide-react';
import { SAMPLE_BANK_STATEMENTS } from '../data/sampleStatements';
import { SampleBankStatement, SUPPORTED_CURRENCIES, CurrencyConfig } from '../types';

interface HeaderProps {
  onSelectSample: (sample: SampleBankStatement) => void;
  onOpenCodeGuide: () => void;
  onOpenDeployHelp?: () => void;
  onReset: () => void;
  hasData: boolean;
  currentCurrency: CurrencyConfig;
  onChangeCurrency: (currency: CurrencyConfig) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectSample,
  onOpenCodeGuide,
  onOpenDeployHelp,
  onReset,
  hasData,
  currentCurrency,
  onChangeCurrency
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-xl shadow-sm">
            {currentCurrency.symbol}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white">
                StatementLens <span className="text-slate-400 font-normal">OCR</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-300 font-medium">Gemini 3.6 Flash Vision Active</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Currency: {currentCurrency.code} ({currentCurrency.symbol})</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Currency Switcher */}
          <div className="relative">
            <select
              value={currentCurrency.code}
              onChange={(e) => {
                const found = SUPPORTED_CURRENCIES.find(c => c.code === e.target.value);
                if (found) onChangeCurrency(found);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 pl-7 pr-3 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer"
              title="Select display currency"
            >
              {SUPPORTED_CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code}
                </option>
              ))}
            </select>
            <Coins className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Sample Statement Dropdown */}
          <div className="relative hidden md:block">
            <select
              onChange={(e) => {
                const found = SAMPLE_BANK_STATEMENTS.find(s => s.id === e.target.value);
                if (found) onSelectSample(found);
                e.target.value = '';
              }}
              defaultValue=""
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2 pl-3 pr-7 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer"
            >
              <option value="" disabled>🇳🇬 Try Bank Statements...</option>
              {SAMPLE_BANK_STATEMENTS.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.itemCount} items)
                </option>
              ))}
            </select>
            <Layers className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Integration Code & Docs Button */}
          <button
            onClick={onOpenCodeGuide}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            title="View Express + Gemini 3.6 Flash code & Google Sheets instructions"
          >
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">API & Guide</span>
          </button>

          {/* GitHub / Deploy Troubleshooting Button */}
          {onOpenDeployHelp && (
            <button
              onClick={onOpenDeployHelp}
              className="flex items-center space-x-1 px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
              title="GitHub & Deployment Guide"
            >
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <span className="hidden lg:inline">GitHub Fix</span>
            </button>
          )}

          {/* Reset Button */}
          {hasData && (
            <button
              onClick={onReset}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 text-xs font-medium rounded-lg border border-slate-700 hover:border-rose-800/60 transition-colors"
              title="Clear data and upload new statement"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New OCR</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
