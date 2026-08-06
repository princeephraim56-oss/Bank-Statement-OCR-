/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { SummaryCards } from './components/SummaryCards';
import { TransactionTable } from './components/TransactionTable';
import { CategoryChart } from './components/CategoryChart';
import { CodeInstructionsModal } from './components/CodeInstructionsModal';
import { DeploymentTroubleshootingModal } from './components/DeploymentTroubleshootingModal';
import { ExtractionResult, SampleBankStatement, TransactionItem, CurrencyConfig, SUPPORTED_CURRENCIES } from './types';
import { getCurrencyConfig } from './utils/currency';
import { FileSpreadsheet, ArrowLeft, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';

export default function App() {
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [activeFileName, setActiveFileName] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCodeGuideOpen, setIsCodeGuideOpen] = useState<boolean>(false);
  const [isDeployHelpOpen, setIsDeployHelpOpen] = useState<boolean>(false);
  
  // Currency state - Defaults to Nigerian Naira (₦ / NGN)
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyConfig>(SUPPORTED_CURRENCIES[0]);

  // Handle live PDF/Image OCR extraction request to backend Express /api/extract
  const handleProcessFile = async (fileData: string, mimeType: string, fileName: string) => {
    setIsLoading(true);
    setError(null);
    setActiveFileName(fileName);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData,
          mimeType,
          fileName
        })
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || json.error || 'Failed to extract transactions from document.');
      }

      const meta = json.data.metadata || {};
      if (meta.currency) {
        setCurrentCurrency(getCurrencyConfig(meta.currency));
      }

      setExtractionResult({
        metadata: meta,
        transactions: json.data.transactions || []
      });

    } catch (err: any) {
      console.error('Extraction Error:', err);
      setError(err?.message || 'Error occurred while processing file with Gemini 3.6 Flash Vision.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle select pre-built sample bank statement
  const handleSelectSample = (sample: SampleBankStatement) => {
    setError(null);
    setActiveFileName(sample.fileName);
    if (sample.sampleData.metadata.currency) {
      setCurrentCurrency(getCurrencyConfig(sample.sampleData.metadata.currency));
    }
    setExtractionResult(sample.sampleData);
  };

  // Handle transaction editing/updates
  const handleUpdateTransactions = (updatedTransactions: TransactionItem[]) => {
    if (extractionResult) {
      setExtractionResult({
        ...extractionResult,
        transactions: updatedTransactions
      });
    }
  };

  // Reset to upload view
  const handleReset = () => {
    setExtractionResult(null);
    setActiveFileName(undefined);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased flex flex-col">
      
      {/* Header Navbar */}
      <Header
        onSelectSample={handleSelectSample}
        onOpenCodeGuide={() => setIsCodeGuideOpen(true)}
        onOpenDeployHelp={() => setIsDeployHelpOpen(true)}
        onReset={handleReset}
        hasData={!!extractionResult}
        currentCurrency={currentCurrency}
        onChangeCurrency={setCurrentCurrency}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {!extractionResult ? (
          /* View 1: Upload Dropzone & Initial Screen */
          <div className="py-4">
            <FileUpload
              onProcessFile={handleProcessFile}
              onSelectSample={handleSelectSample}
              isLoading={isLoading}
              error={error}
            />
          </div>
        ) : (
          /* View 2: OCR Extracted Results Dashboard & Table */
          <div className="space-y-6">
            
            {/* Top Navigation & Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleReset}
                  className="p-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-slate-700 shadow-2xs transition-colors flex items-center space-x-1 text-xs font-semibold cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Upload Another File</span>
                </button>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Extracted Transactions Table</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {extractionResult.transactions.length} Rows OCR
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Review, edit, or copy formatted CSV data directly to Google Sheets or Excel
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsDeployHelpOpen(true)}
                  className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-2xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-sky-500" />
                  <span>GitHub & Hosting Guide</span>
                </button>
                <button
                  onClick={() => setIsCodeGuideOpen(true)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-2xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Integration Code Snippet</span>
                </button>
              </div>
            </div>

            {/* Summary Top Cards */}
            <SummaryCards
              transactions={extractionResult.transactions}
              metadata={extractionResult.metadata}
              fileName={activeFileName}
              currency={currentCurrency}
            />

            {/* Category Chart & Table Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              
              {/* Category Breakdown Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                <CategoryChart
                  transactions={extractionResult.transactions}
                  currency={currentCurrency}
                />

                {/* Quick Google Sheets Instructions Box */}
                <div className="bg-emerald-900/90 text-emerald-100 rounded-xl p-4 text-xs space-y-2 border border-emerald-800 shadow-2xs">
                  <div className="flex items-center space-x-1.5 font-bold text-white">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Google Sheets Quick Paste</span>
                  </div>
                  <p className="text-emerald-200/90 leading-relaxed">
                    Click <strong>"Copy for Google Sheets"</strong> above the table, then open Google Sheets and press <code className="bg-emerald-950 px-1.5 py-0.5 rounded text-white font-mono font-bold">Ctrl+V</code> on cell A1.
                  </p>
                </div>
              </div>

              {/* Transactions Table Main Container */}
              <div className="lg:col-span-3">
                <TransactionTable
                  transactions={extractionResult.transactions}
                  onUpdateTransactions={handleUpdateTransactions}
                  currency={currentCurrency}
                />
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Code & Instructions Guide Modal */}
      <CodeInstructionsModal
        isOpen={isCodeGuideOpen}
        onClose={() => setIsCodeGuideOpen(false)}
      />

      {/* Deployment Troubleshooting Modal */}
      <DeploymentTroubleshootingModal
        isOpen={isDeployHelpOpen}
        onClose={() => setIsDeployHelpOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">Bank Statement OCR Extractor</span>
            <span>•</span>
            <span>Default Currency: {currentCurrency.name}</span>
            <span>•</span>
            <span>Powered by Gemini 3.6 Flash Vision</span>
          </div>
          <div>
            <span>Ready for Google Sheets • Positive Deposits (+), Negative Expenses (-)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
