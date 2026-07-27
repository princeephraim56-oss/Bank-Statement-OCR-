import React from 'react';
import { FileSpreadsheet, Code2, Sparkles, Layers, RefreshCw } from 'lucide-react';
import { SAMPLE_BANK_STATEMENTS } from '../data/sampleStatements';
import { SampleBankStatement } from '../types';

interface HeaderProps {
  onSelectSample: (sample: SampleBankStatement) => void;
  onOpenCodeGuide: () => void;
  onReset: () => void;
  hasData: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectSample,
  onOpenCodeGuide,
  onReset,
  hasData
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white">Bank Statement OCR</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-3 h-3" /> Gemini 3.6 Flash Vision
              </span>
            </div>
            <p className="text-xs text-slate-400">PDF/Image OCR to CSV ready for Google Sheets & Excel</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Sample Statement Dropdown */}
          <div className="relative">
            <select
              onChange={(e) => {
                const found = SAMPLE_BANK_STATEMENTS.find(s => s.id === e.target.value);
                if (found) onSelectSample(found);
                e.target.value = '';
              }}
              defaultValue=""
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2 px-3 pr-8 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer"
            >
              <option value="" disabled>⚡ Try Sample Statements...</option>
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
            title="View Express + Gemini 3.6 Flash code snippet"
          >
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Extraction Code</span>
          </button>

          {/* Reset Button */}
          {hasData && (
            <button
              onClick={onReset}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 text-xs font-medium rounded-lg border border-slate-700 hover:border-rose-800/50 transition-colors"
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
