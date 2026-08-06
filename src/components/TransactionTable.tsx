import React, { useState, useMemo } from 'react';
import { TransactionItem, CurrencyConfig } from '../types';
import { 
  Download, Check, Search, Plus, Trash2, Edit3, 
  Filter, FileSpreadsheet, ArrowUpRight, ArrowDownLeft, X, Save,
  Calendar, FileText, ChevronDown, Layers
} from 'lucide-react';
import { 
  downloadCsvFile, copyToClipboard, generateTsvForSheets, 
  extractTransactionYear, generateCsv, generateYearSeparatedCsv 
} from '../utils/csv';
import { formatCurrencyAmount } from '../utils/currency';

interface TransactionTableProps {
  transactions: TransactionItem[];
  onUpdateTransactions: (updated: TransactionItem[]) => void;
  currency: CurrencyConfig;
  availableFiles?: { id: string; fileName: string }[];
}

const CATEGORY_PILLS: Record<string, string> = {
  groceries: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  food: 'bg-orange-50 text-orange-700 border-orange-200',
  fuel: 'bg-amber-50 text-amber-700 border-amber-200',
  transport: 'bg-purple-50 text-purple-700 border-purple-200',
  bills: 'bg-blue-50 text-blue-700 border-blue-200',
  gifts: 'bg-pink-50 text-pink-700 border-pink-200',
  shopping: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  salary: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
  income: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
  transfer: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  utility: 'bg-rose-50 text-rose-700 border-rose-200',
  entertainment: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  healthcare: 'bg-sky-50 text-sky-700 border-sky-200',
  software: 'bg-violet-50 text-violet-700 border-violet-200',
  subscription: 'bg-teal-50 text-teal-700 border-teal-200',
  fees: 'bg-rose-100 text-rose-800 border-rose-200',
  other: 'bg-slate-100 text-slate-600 border-slate-200'
};

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onUpdateTransactions,
  currency,
  availableFiles = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'deposits' | 'expenses'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedFile, setSelectedFile] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TransactionItem>>({});
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  // Extract unique years from all transactions
  const detectedYears = useMemo(() => {
    const yearsSet = new Set<number>();
    for (const t of transactions) {
      yearsSet.add(extractTransactionYear(t));
    }
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [transactions]);

  // Extract unique categories for dropdown
  const uniqueCategories: string[] = useMemo(() => {
    return Array.from(
      new Set<string>(transactions.map(t => (t.category || 'other').toLowerCase()))
    ).sort();
  }, [transactions]);

  // Extract unique source files
  const uniqueSourceFiles = useMemo(() => {
    const files = new Set<string>();
    for (const t of transactions) {
      if (t.sourceFile) files.add(t.sourceFile);
    }
    return Array.from(files);
  }, [transactions]);

  const hasMultipleFiles = uniqueSourceFiles.length > 1 || (availableFiles && availableFiles.length > 1);
  const hasMultipleYears = detectedYears.length > 1;

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Year filter
      if (selectedYear !== 'all') {
        const txYear = extractTransactionYear(t);
        if (txYear.toString() !== selectedYear) return false;
      }

      // File filter
      if (selectedFile !== 'all' && t.sourceFile && t.sourceFile !== selectedFile) {
        return false;
      }

      // Type filter
      if (filterType === 'deposits' && t.amount <= 0) return false;
      if (filterType === 'expenses' && t.amount >= 0) return false;

      // Category filter
      if (selectedCategory !== 'all' && (t.category || 'other').toLowerCase() !== selectedCategory) {
        return false;
      }

      // Search term
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchDesc = t.description.toLowerCase().includes(term);
        const matchNotes = (t.notes || '').toLowerCase().includes(term);
        const matchCat = (t.category || '').toLowerCase().includes(term);
        const matchDate = (t.date || '').includes(term) || (t.transactionDate || '').includes(term);
        const matchAmt = t.amount.toString().includes(term);
        const matchFile = (t.sourceFile || '').toLowerCase().includes(term);
        return matchDesc || matchNotes || matchCat || matchDate || matchAmt || matchFile;
      }

      return true;
    });
  }, [transactions, selectedYear, selectedFile, filterType, selectedCategory, searchTerm]);

  // Calculate summary figures
  const totalFilteredDeposits = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredExpenses = filteredTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Group filtered transactions by year for section display when in "All" view
  const groupedByYear = useMemo(() => {
    const map = new Map<number, TransactionItem[]>();
    for (const tx of filteredTransactions) {
      const yr = extractTransactionYear(tx);
      const list = map.get(yr) || [];
      list.push(tx);
      map.set(yr, list);
    }
    const sortedMap = new Map<number, TransactionItem[]>();
    const sortedKeys = Array.from(map.keys()).sort((a, b) => b - a);
    for (const k of sortedKeys) {
      sortedMap.set(k, map.get(k)!);
    }
    return sortedMap;
  }, [filteredTransactions]);

  // Handle Copy to Clipboard for Google Sheets (TSV Grid format with year separation)
  const handleCopyForSheets = async () => {
    const tsvText = generateTsvForSheets(filteredTransactions, hasMultipleFiles);
    const success = await copyToClipboard(tsvText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Handle Consolidated Year-Separated CSV Download (Standard Requirement)
  const handleDownloadUnifiedCsv = () => {
    const baseName = hasMultipleFiles ? 'multi_bank_statements_consolidated' : 'bank_statement';
    const yearTag = selectedYear === 'all' ? (detectedYears.length > 1 ? `${detectedYears[detectedYears.length-1]}-${detectedYears[0]}` : detectedYears[0] || 'all') : selectedYear;
    const filename = `${baseName}_${currency.code}_${yearTag}_${new Date().toISOString().slice(0,10)}.csv`;
    downloadCsvFile(filteredTransactions, filename, hasMultipleFiles);
    setIsExportDropdownOpen(false);
  };

  // Handle CSV with Year Column
  const handleDownloadCsvWithYearColumn = () => {
    const csvContent = generateCsv(filteredTransactions, true, true, hasMultipleFiles);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bank_statements_with_year_col_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExportDropdownOpen(false);
  };

  // Start Editing
  const startEditing = (item: TransactionItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  // Save Edit
  const saveEditing = (id: string) => {
    const updated = transactions.map(t => {
      if (t.id === id) {
        const parsedAmt = typeof editForm.amount === 'number' ? editForm.amount : parseFloat(String(editForm.amount || 0));
        const updatedItem = {
          ...t,
          ...editForm,
          amount: parsedAmt
        } as TransactionItem;
        updatedItem.year = extractTransactionYear(updatedItem);
        return updatedItem;
      }
      return t;
    });
    onUpdateTransactions(updated);
    setEditingId(null);
  };

  // Delete Row
  const handleDeleteRow = (id: string) => {
    if (confirm('Delete this transaction line item?')) {
      onUpdateTransactions(transactions.filter(t => t.id !== id));
    }
  };

  // Add New Manual Row
  const handleAddRow = () => {
    const today = new Date().toISOString().slice(0, 10);
    const currentYear = new Date().getFullYear();
    const newRow: TransactionItem = {
      id: `tx-manual-${Date.now()}`,
      date: today,
      transactionDate: today,
      amount: -150.00,
      category: 'other',
      description: 'Manual Transaction Entry',
      notes: 'Added manually',
      sourceFile: hasMultipleFiles ? (selectedFile !== 'all' ? selectedFile : 'Manual Entry') : undefined,
      year: currentYear
    };
    onUpdateTransactions([newRow, ...transactions]);
    startEditing(newRow);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      
      {/* Table Control Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex flex-col space-y-3.5">
        
        {/* Top Filter Row: Year Tabs, Search, Category, File Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          
          {/* Left Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Search Box */}
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search date, desc, amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-slate-800 text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
            </div>

            {/* Year Selector Tabs if multiple years exist */}
            {hasMultipleYears && (
              <div className="inline-flex rounded-lg p-1 bg-slate-200/80 text-xs font-semibold text-slate-700 items-center">
                <span className="px-2 text-[11px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Year:
                </span>
                <button
                  onClick={() => setSelectedYear('all')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    selectedYear === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  All Years ({transactions.length})
                </button>
                {detectedYears.map(yr => {
                  const count = transactions.filter(t => extractTransactionYear(t) === yr).length;
                  return (
                    <button
                      key={yr}
                      onClick={() => setSelectedYear(yr.toString())}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        selectedYear === yr.toString()
                          ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                          : 'hover:text-slate-900'
                      }`}
                    >
                      {yr} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Type Filter Tabs */}
            <div className="inline-flex rounded-lg p-1 bg-slate-200/80 text-xs font-medium text-slate-600">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-md transition-all ${filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'}`}
              >
                All ({transactions.length})
              </button>
              <button
                onClick={() => setFilterType('deposits')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${filterType === 'deposits' ? 'bg-emerald-600 text-white shadow-2xs font-bold' : 'hover:text-slate-900'}`}
              >
                <ArrowDownLeft className="w-3 h-3" /> Deposits
              </button>
              <button
                onClick={() => setFilterType('expenses')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${filterType === 'expenses' ? 'bg-rose-600 text-white shadow-2xs font-bold' : 'hover:text-slate-900'}`}
              >
                <ArrowUpRight className="w-3 h-3" /> Expenses
              </button>
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white text-slate-700 text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs cursor-pointer"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            {/* Source Statement File Dropdown (if multiple files) */}
            {hasMultipleFiles && (
              <select
                value={selectedFile}
                onChange={(e) => setSelectedFile(e.target.value)}
                className="bg-white text-slate-700 text-xs font-medium px-3 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer max-w-[180px] truncate"
              >
                <option value="all">All Statements ({uniqueSourceFiles.length})</option>
                {uniqueSourceFiles.map(file => (
                  <option key={file} value={file}>
                    {file}
                  </option>
                ))}
              </select>
            )}

          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap">
            
            <button
              onClick={handleAddRow}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors border border-slate-300 shadow-2xs"
              title="Add a manual transaction row"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Row</span>
            </button>

            {/* COPY FOR GOOGLE SHEETS BUTTON (Year-Separated TSV Grid format) */}
            <button
              onClick={handleCopyForSheets}
              className={`px-4 py-2 text-xs font-bold rounded-lg shadow-md flex items-center space-x-2 transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              title="Copy formatted CSV / TSV grid separated by statement year directly for Google Sheets"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied for Sheets!</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Copy for Google Sheets</span>
                </>
              )}
            </button>

            {/* UNIFIED CSV DOWNLOAD BUTTON WITH YEAR SEPARATION */}
            <div className="relative">
              <div className="inline-flex rounded-lg shadow-sm">
                <button
                  onClick={handleDownloadUnifiedCsv}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-l-lg flex items-center space-x-1.5 transition-colors"
                  title="Download single unified CSV file separated by year"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Single CSV</span>
                </button>
                <button
                  onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                  className="px-2 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-r-lg border-l border-slate-700 transition-colors"
                  title="More CSV format options"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Export Format Dropdown Menu */}
              {isExportDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-left">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    CSV Export Layouts
                  </div>
                  <button
                    onClick={handleDownloadUnifiedCsv}
                    className="w-full px-3.5 py-2 text-left text-xs text-slate-800 hover:bg-emerald-50 hover:text-emerald-900 flex flex-col"
                  >
                    <span className="font-semibold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" /> Separated by Year (Sections)
                    </span>
                    <span className="text-[11px] text-slate-500">Single CSV with year headers and balances (Default)</span>
                  </button>
                  <button
                    onClick={handleDownloadCsvWithYearColumn}
                    className="w-full px-3.5 py-2 text-left text-xs text-slate-800 hover:bg-emerald-50 hover:text-emerald-900 flex flex-col"
                  >
                    <span className="font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" /> Flat Table with Year Column
                    </span>
                    <span className="text-[11px] text-slate-500">Includes explicit Year column for Pivot Tables</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Multi-Year & Multi-Statement Notice Pill */}
        {hasMultipleYears && (
          <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200 rounded-lg px-3 py-1.5 text-xs text-emerald-900">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold flex items-center gap-1 text-emerald-800">
                <Calendar className="w-3.5 h-3.5" /> Multi-Year Bank Statement Output:
              </span>
              <span>
                Detected {detectedYears.length} calendar years ({detectedYears.join(', ')}). Output is automatically combined into a <strong>single CSV separated by year</strong>.
              </span>
            </div>
            {selectedYear !== 'all' && (
              <button
                onClick={() => setSelectedYear('all')}
                className="text-[11px] text-emerald-700 underline font-semibold hover:text-emerald-900 ml-2 shrink-0"
              >
                Show All Years
              </button>
            )}
          </div>
        )}

      </div>

      {/* Main Table View */}
      <div className="overflow-x-auto min-h-[360px]">
        <table className="w-full border-collapse text-left text-sm">
          
          {/* Table Header */}
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600 w-28 text-xs uppercase tracking-wider">Post Date</th>
              <th className="px-4 py-3 font-semibold text-slate-600 w-28 text-xs uppercase tracking-wider">Trans Date</th>
              <th className="px-4 py-3 font-semibold text-slate-600 w-32 text-right text-xs uppercase tracking-wider">
                Amount ({currency.symbol})
              </th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 font-semibold text-slate-600 w-44 text-xs uppercase tracking-wider">
                Category/Notes
              </th>
              {hasMultipleFiles && (
                <th className="px-4 py-3 font-semibold text-slate-600 w-36 text-xs uppercase tracking-wider">
                  Statement
                </th>
              )}
              <th className="px-4 py-3 font-semibold text-slate-600 w-20 text-center text-xs uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 text-slate-800 text-xs">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={hasMultipleFiles ? 7 : 6} className="py-14 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Filter className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-700">No transactions match current filters</p>
                    <p className="text-xs text-slate-400">Try clearing search keywords or switching category/year filters</p>
                  </div>
                </td>
              </tr>
            ) : selectedYear === 'all' && hasMultipleYears ? (
              /* Grouped by Year with Section Headers */
              Array.from(groupedByYear.entries()).map(([year, yearTxs]) => {
                const yearDeposits = yearTxs.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
                const yearExpenses = yearTxs.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
                const yearNet = yearDeposits - yearExpenses;

                return (
                  <React.Fragment key={`year-section-${year}`}>
                    {/* Year Section Divider Row */}
                    <tr className="bg-slate-100/90 border-y border-slate-200 text-slate-700">
                      <td colSpan={hasMultipleFiles ? 7 : 6} className="px-4 py-2 font-bold">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-white text-[11px] font-bold">
                              STATEMENT YEAR {year}
                            </span>
                            <span className="text-xs text-slate-600 font-medium">
                              ({yearTxs.length} Transactions)
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 text-[11px] font-mono">
                            <span className="text-emerald-700 font-semibold">
                              Deposits: +{formatCurrencyAmount(yearDeposits, currency.symbol, false)}
                            </span>
                            <span className="text-rose-700 font-semibold">
                              Expenses: -{formatCurrencyAmount(yearExpenses, currency.symbol, false)}
                            </span>
                            <span className={`font-bold ${yearNet >= 0 ? 'text-slate-800' : 'text-rose-800'}`}>
                              Net: {yearNet >= 0 ? '+' : ''}{formatCurrencyAmount(yearNet, currency.symbol, false)}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Transaction Rows for this year */}
                    {yearTxs.map((tx) => renderTableRow(tx))}
                  </React.Fragment>
                );
              })
            ) : (
              /* Single year or filtered year direct rows */
              filteredTransactions.map((tx) => renderTableRow(tx))
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Status Bar */}
      <div className="mt-auto bg-slate-50 p-3.5 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <span>{filteredTransactions.length} transactions</span>
          {hasMultipleYears && (
            <>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">{detectedYears.length} Statement Years</span>
            </>
          )}
          {hasMultipleFiles && (
            <>
              <span>•</span>
              <span className="text-blue-700 font-semibold">{uniqueSourceFiles.length} Bank Statements</span>
            </>
          )}
          <span>•</span>
          <span>Single CSV Export Ready</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 uppercase font-semibold">Expenses:</span>
            <span className="text-xs font-bold text-rose-600 font-mono">
              -{formatCurrencyAmount(totalFilteredExpenses, currency.symbol, false)}
            </span>
          </div>
          <div className="h-3 w-[1px] bg-slate-300 hidden sm:block"></div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 uppercase font-semibold">Deposits:</span>
            <span className="text-xs font-bold text-emerald-600 font-mono">
              +{formatCurrencyAmount(totalFilteredDeposits, currency.symbol, false)}
            </span>
          </div>
        </div>
      </div>

    </div>
  );

  // Helper row renderer
  function renderTableRow(tx: TransactionItem) {
    const isEditing = editingId === tx.id;
    const isDeposit = tx.amount > 0;
    const categoryClass = CATEGORY_PILLS[(tx.category || 'other').toLowerCase()] || CATEGORY_PILLS['other'];

    return (
      <tr
        key={tx.id}
        className={`hover:bg-slate-50 transition-colors ${
          isEditing ? 'bg-amber-50/60' : ''
        }`}
      >
        {/* Post Date */}
        <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
          {isEditing ? (
            <input
              type="date"
              value={editForm.date || ''}
              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              className="w-full bg-white border border-amber-300 rounded px-1.5 py-1 text-xs"
            />
          ) : (
            tx.date
          )}
        </td>

        {/* Trans Date */}
        <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
          {isEditing ? (
            <input
              type="date"
              value={editForm.transactionDate || ''}
              onChange={(e) => setEditForm({ ...editForm, transactionDate: e.target.value })}
              className="w-full bg-white border border-amber-300 rounded px-1.5 py-1 text-xs"
            />
          ) : (
            tx.transactionDate || tx.date
          )}
        </td>

        {/* Amount */}
        <td className={`px-4 py-3 text-right font-semibold font-mono whitespace-nowrap ${
          isDeposit ? 'text-emerald-600' : 'text-rose-600'
        }`}>
          {isEditing ? (
            <input
              type="number"
              step="0.01"
              value={editForm.amount !== undefined ? editForm.amount : ''}
              onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })}
              className="w-28 bg-white border border-amber-300 rounded px-1.5 py-1 text-xs text-right font-mono"
            />
          ) : (
            formatCurrencyAmount(tx.amount, currency.symbol, true)
          )}
        </td>

        {/* Description */}
        <td className="px-4 py-3 text-slate-800">
          {isEditing ? (
            <input
              type="text"
              value={editForm.description || ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full bg-white border border-amber-300 rounded px-2 py-1 text-xs font-sans"
            />
          ) : (
            <span className="font-medium text-slate-800">{tx.description}</span>
          )}
        </td>

        {/* Category & Notes */}
        <td className="px-4 py-3">
          {isEditing ? (
            <div className="space-y-1.5">
              <input
                type="text"
                placeholder="Category"
                value={editForm.category || ''}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="w-full bg-white border border-amber-300 rounded px-2 py-0.5 text-xs"
              />
              <input
                type="text"
                placeholder="Notes/Memo"
                value={editForm.notes || ''}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="w-full bg-white border border-amber-300 rounded px-2 py-0.5 text-[11px]"
              />
            </div>
          ) : (
            <div className="flex flex-col items-start gap-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${categoryClass}`}>
                {tx.category || 'other'}
              </span>
              {tx.notes && (
                <span className="text-[11px] text-slate-400 italic line-clamp-1">
                  {tx.notes}
                </span>
              )}
            </div>
          )}
        </td>

        {/* Source File Badge (if multi-file) */}
        {hasMultipleFiles && (
          <td className="px-4 py-3 whitespace-nowrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 max-w-[130px] truncate" title={tx.sourceFile}>
              <FileText className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{tx.sourceFile || 'Statement'}</span>
            </span>
          </td>
        )}

        {/* Actions */}
        <td className="px-4 py-3 text-center whitespace-nowrap">
          {isEditing ? (
            <div className="flex items-center justify-center space-x-1">
              <button
                onClick={() => saveEditing(tx.id)}
                className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                title="Save Changes"
              >
                <Save className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-1.5">
              <button
                onClick={() => startEditing(tx)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
                title="Edit row"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDeleteRow(tx.id)}
                className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                title="Delete row"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </td>

      </tr>
    );
  }
};
