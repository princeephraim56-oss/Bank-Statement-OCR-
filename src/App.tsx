/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { FileUpload, BatchProgressInfo } from './components/FileUpload';
import { SummaryCards } from './components/SummaryCards';
import { TransactionTable } from './components/TransactionTable';
import { CategoryChart } from './components/CategoryChart';
import { CodeInstructionsModal } from './components/CodeInstructionsModal';
import { DeploymentTroubleshootingModal } from './components/DeploymentTroubleshootingModal';
import { 
  ExtractionResult, SampleBankStatement, TransactionItem, 
  CurrencyConfig, SUPPORTED_CURRENCIES, ProcessedFileItem 
} from './types';
import { getCurrencyConfig } from './utils/currency';
import { extractTransactionYear } from './utils/csv';
import { FileSpreadsheet, ArrowLeft, CheckCircle2, Sparkles, HelpCircle, Files, Calendar } from 'lucide-react';

export default function App() {
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [activeFileName, setActiveFileName] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<BatchProgressInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCodeGuideOpen, setIsCodeGuideOpen] = useState<boolean>(false);
  const [isDeployHelpOpen, setIsDeployHelpOpen] = useState<boolean>(false);
  
  // Currency state - Automatically adapts to document currency
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyConfig>(SUPPORTED_CURRENCIES[0]);

  // Handle multiple PDF/Image OCR extraction requests to backend Express /api/extract
  const handleProcessFiles = async (
    files: { fileData: string; mimeType: string; fileName: string; fileSize: number }[]
  ) => {
    if (files.length === 0) return;

    setIsLoading(true);
    setError(null);
    const combinedName = files.length === 1 
      ? files[0].fileName 
      : `${files[0].fileName} (+${files.length - 1} more statements)`;
    setActiveFileName(combinedName);

    const allTransactions: TransactionItem[] = [];
    const processedFiles: ProcessedFileItem[] = [];
    let detectedCurrency: CurrencyConfig | null = null;
    let bankName = '';
    let accountHolder = '';
    let startPeriod = '';
    let endPeriod = '';
    let totalDeposits = 0;
    let totalWithdrawals = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const item = files[i];
        
        let json: any = null;
        let fileError: string | null = null;
        const maxFileRetries = 2;

        for (let attempt = 1; attempt <= maxFileRetries; attempt++) {
          try {
            setBatchProgress({
              currentFileIndex: i + 1,
              totalFiles: files.length,
              currentFileName: item.fileName,
              stage: attempt === 1 
                ? 'Processing document with Gemini Vision OCR...' 
                : `Retrying (${attempt}/${maxFileRetries}) with Gemini OCR...`
            });

            const response = await fetch('/api/extract', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileData: item.fileData,
                mimeType: item.mimeType,
                fileName: item.fileName
              })
            });

            const contentType = response.headers.get('content-type') || '';
            let responseData: any = null;

            if (contentType.includes('application/json')) {
              responseData = await response.json();
            } else {
              const rawText = await response.text();
              throw new Error(`Server returned unexpected ${response.status} response: ${rawText.slice(0, 100)}`);
            }

            if (!response.ok || !responseData.success) {
              let errMsg = responseData?.message || responseData?.error || `HTTP error ${response.status}`;
              // Clean nested JSON if returned
              try {
                if (typeof errMsg === 'string' && errMsg.startsWith('{')) {
                  const parsed = JSON.parse(errMsg);
                  if (parsed?.error?.message) errMsg = parsed.error.message;
                }
              } catch {
                // keep string
              }
              throw new Error(errMsg);
            }

            json = responseData;
            break; // Success! Exit retry loop
          } catch (attemptErr: any) {
            fileError = attemptErr?.message || 'OCR Extraction failed';
            console.warn(`Extraction attempt ${attempt} for "${item.fileName}" failed:`, fileError);
            
            const isTransient = /503|429|demand|UNAVAILABLE|RESOURCE_EXHAUSTED|fetch failed|network|ECONNRESET/i.test(fileError);
            if (isTransient && attempt < maxFileRetries) {
              await new Promise(r => setTimeout(r, attempt * 2000));
            } else {
              break;
            }
          }
        }

        if (!json || !json.success) {
          throw new Error(
            `Failed processing "${item.fileName}": ${fileError || 'Unable to extract transactions from document.'}`
          );
        }

        const meta = json.data?.metadata || {};
        const txs: TransactionItem[] = (json.data?.transactions || []).map((t: TransactionItem, idx: number) => {
          const year = extractTransactionYear(t);
          return {
            ...t,
            id: t.id ? `file${i}-${t.id}` : `tx-${i}-${idx}-${Date.now()}`,
            sourceFile: item.fileName,
            year
          };
        });

        const fileDetectedYears = Array.from(new Set(txs.map(t => extractTransactionYear(t)))).sort();

        processedFiles.push({
          id: `file-proc-${i}-${Date.now()}`,
          fileName: item.fileName,
          fileSize: item.fileSize,
          status: 'completed',
          detectedYears: fileDetectedYears,
          metadata: meta
        });

        allTransactions.push(...txs);

        // Aggregate metadata
        if (!bankName && meta.bankName) bankName = meta.bankName;
        if (!accountHolder && meta.accountHolder) accountHolder = meta.accountHolder;
        if (meta.statementPeriod) {
          if (!startPeriod) startPeriod = meta.statementPeriod;
          endPeriod = meta.statementPeriod;
        }
        if (typeof meta.totalDeposits === 'number') totalDeposits += meta.totalDeposits;
        if (typeof meta.totalWithdrawals === 'number') totalWithdrawals += meta.totalWithdrawals;

        // Auto-detect currency from first file with currency info
        if (!detectedCurrency && (meta.currency || meta.currencyCode || meta.currencySymbol)) {
          detectedCurrency = getCurrencyConfig(
            meta.currencyCode || meta.currency,
            meta.currencySymbol
          );
        }
      }

      if (detectedCurrency) {
        setCurrentCurrency(detectedCurrency);
      }

      // Sort transactions by date descending
      allTransactions.sort((a, b) => {
        const dateA = a.date || a.transactionDate || '';
        const dateB = b.date || b.transactionDate || '';
        return dateB.localeCompare(dateA);
      });

      // Collect all unique years
      const yearsPresent = Array.from(
        new Set(allTransactions.map(t => extractTransactionYear(t)))
      ).sort((a, b) => b - a);

      const periodString = files.length > 1
        ? `${yearsPresent.length} Statement Years (${yearsPresent.join(', ')})`
        : (startPeriod || 'Statement Period Extracted');

      setExtractionResult({
        metadata: {
          bankName: bankName || 'Bank Statement Archive',
          accountHolder: accountHolder || undefined,
          statementPeriod: periodString,
          totalDeposits: totalDeposits || undefined,
          totalWithdrawals: totalWithdrawals || undefined,
          currency: detectedCurrency?.code,
          currencyCode: detectedCurrency?.code,
          currencySymbol: detectedCurrency?.symbol
        },
        transactions: allTransactions,
        years: yearsPresent,
        files: processedFiles
      });

    } catch (err: any) {
      console.error('Batch Extraction Error:', err);
      setError(err?.message || 'Error occurred while processing files with Gemini 3.6 Flash Vision.');
    } finally {
      setIsLoading(false);
      setBatchProgress(null);
    }
  };

  // Handle select pre-built sample bank statement
  const handleSelectSample = (sample: SampleBankStatement) => {
    setError(null);
    setActiveFileName(sample.fileName);
    const meta = sample.sampleData.metadata;
    if (meta.currency || meta.currencyCode || meta.currencySymbol) {
      setCurrentCurrency(getCurrencyConfig(meta.currencyCode || meta.currency, meta.currencySymbol));
    }
    
    // Ensure all transactions have year tags
    const enrichedTxs = sample.sampleData.transactions.map(t => ({
      ...t,
      year: t.year || extractTransactionYear(t)
    }));

    const years = sample.sampleData.years || Array.from(new Set(enrichedTxs.map(t => extractTransactionYear(t)))).sort((a,b) => b - a);

    setExtractionResult({
      ...sample.sampleData,
      transactions: enrichedTxs,
      years
    });
  };

  // Handle transaction editing/updates
  const handleUpdateTransactions = (updatedTransactions: TransactionItem[]) => {
    if (extractionResult) {
      const years = Array.from(new Set(updatedTransactions.map(t => extractTransactionYear(t)))).sort((a,b) => b - a);
      setExtractionResult({
        ...extractionResult,
        transactions: updatedTransactions,
        years
      });
    }
  };

  // Reset to upload view
  const handleReset = () => {
    setExtractionResult(null);
    setActiveFileName(undefined);
    setError(null);
    setBatchProgress(null);
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
              onProcessFiles={handleProcessFiles}
              onSelectSample={handleSelectSample}
              isLoading={isLoading}
              batchProgress={batchProgress}
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
                  <span>Upload More Statements</span>
                </button>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
                    <span>Extracted Transactions Table</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {extractionResult.transactions.length} Rows OCR
                    </span>
                    {extractionResult.years && extractionResult.years.length > 1 && (
                      <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        {extractionResult.years.length} Calendar Years
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Unified database with <strong>single CSV separated by year</strong> for Google Sheets or Excel
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
              files={extractionResult.files}
              years={extractionResult.years}
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
                    <span>Google Sheets Paste Ready</span>
                  </div>
                  <p className="text-emerald-200/90 leading-relaxed">
                    Click <strong>"Copy for Google Sheets"</strong>, then switch to your spreadsheet and press <code className="bg-emerald-950 px-1.5 py-0.5 rounded text-white font-mono font-bold">Ctrl+V</code>. Data is neatly grouped with year separation headers.
                  </p>
                </div>
              </div>

              {/* Transactions Table Main Container */}
              <div className="lg:col-span-3">
                <TransactionTable
                  transactions={extractionResult.transactions}
                  onUpdateTransactions={handleUpdateTransactions}
                  currency={currentCurrency}
                  availableFiles={extractionResult.files}
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
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="font-bold text-slate-700">Bank Statement OCR Extractor</span>
            <span>•</span>
            <span>Active Currency: {currentCurrency.name} ({currentCurrency.symbol})</span>
            <span>•</span>
            <span>Multi-Statement & Auto-Year Separation</span>
            <span>•</span>
            <span>Gemini 3.6 Flash Vision</span>
          </div>
          <div>
            <span>Direct CSV & Google Sheets Compatibility (Ctrl+V)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
