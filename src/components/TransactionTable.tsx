import React, { useState } from 'react';
import { TransactionItem, CurrencyConfig } from '../types';
import { 
  Download, Check, Search, Plus, Trash2, Edit3, 
  Filter, FileSpreadsheet, ArrowUpRight, ArrowDownLeft, X, Save
} from 'lucide-react';
import { downloadCsvFile, copyToClipboard, generateTsvForSheets } from '../utils/csv';
import { formatCurrencyAmount } from '../utils/currency';

interface TransactionTableProps {
  transactions: TransactionItem[];
  onUpdateTransactions: (updated: TransactionItem[]) => void;
  currency: CurrencyConfig;
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
  currency
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'deposits' | 'expenses'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TransactionItem>>({});

  // Get unique categories for dropdown
  const uniqueCategories: string[] = Array.from(
    new Set<string>(transactions.map(t => (t.category || 'other').toLowerCase()))
  ).sort();

  // Filter logic
  const filteredTransactions = transactions.filter(t => {
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
      return matchDesc || matchNotes || matchCat || matchDate || matchAmt;
    }

    return true;
  });

  // Calculate summary figures
  const totalFilteredDeposits = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredExpenses = filteredTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Handle Copy to Clipboard for Google Sheets (TSV Grid format)
  const handleCopyForSheets = async () => {
    const tsvText = generateTsvForSheets(filteredTransactions, true);
    const success = await copyToClipboard(tsvText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Handle CSV Download
  const handleDownloadCsv = () => {
    downloadCsvFile(filteredTransactions, `bank_statement_${currency.code}_${new Date().toISOString().slice(0,10)}.csv`);
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
        return {
          ...t,
          ...editForm,
          amount: typeof editForm.amount === 'number' ? editForm.amount : parseFloat(String(editForm.amount || 0))
        } as TransactionItem;
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
    const newRow: TransactionItem = {
      id: `tx-manual-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      transactionDate: new Date().toISOString().slice(0, 10),
      amount: -15000.00,
      category: 'other',
      description: 'Manual Transaction Entry',
      notes: 'Added manually'
    };
    onUpdateTransactions([newRow, ...transactions]);
    startEditing(newRow);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      
      {/* Table Control Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search description, date, amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-slate-800 text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
          </div>

          {/* Type Filter Tabs */}
          <div className="inline-flex rounded-lg p-1 bg-slate-200/80 text-xs font-medium text-slate-600">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md transition-all ${filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'}`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('deposits')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${filterType === 'deposits' ? 'bg-emerald-600 text-white shadow-2xs font-bold' : 'hover:text-slate-900'}`}
            >
              <ArrowDownLeft className="w-3 h-3" /> Deposits
            </button>
            <button
              onClick={() => setFilterType('expenses')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${filterType === 'expenses' ? 'bg-rose-600 text-white shadow-2xs font-bold' : 'hover:text-slate-900'}`}
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
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap">
          
          <button
            onClick={handleAddRow}
            className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors border border-slate-300 shadow-2xs"
            title="Add a manual transaction row"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </button>

          {/* COPY FOR GOOGLE SHEETS BUTTON (Styled per Professional Polish theme) */}
          <button
            onClick={handleCopyForSheets}
            className={`px-4 py-2 text-xs font-bold rounded-lg shadow-md flex items-center space-x-2 transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            title="Copy formatted CSV / TSV grid directly to clipboard for Google Sheets"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                <span>Copy for Google Sheets</span>
              </>
            )}
          </button>

          {/* DOWNLOAD CSV BUTTON */}
          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors"
            title="Download CSV spreadsheet file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download CSV</span>
          </button>

        </div>

      </div>

      {/* Main Table View */}
      <div className="overflow-x-auto min-h-[360px]">
        <table className="w-full border-collapse text-left text-sm">
          
          {/* Table Header */}
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600 w-32 text-xs uppercase tracking-wider">Post Date</th>
              <th className="px-4 py-3 font-semibold text-slate-600 w-32 text-xs uppercase tracking-wider">Trans Date</th>
              <th className="px-4 py-3 font-semibold text-slate-600 w-36 text-right text-xs uppercase tracking-wider">
                Amount ({currency.symbol})
              </th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 font-semibold text-slate-600 w-44 text-xs uppercase tracking-wider">
                Category/Notes
              </th>
              <th className="px-4 py-3 font-semibold text-slate-600 w-24 text-center text-xs uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 text-slate-800 text-xs">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Filter className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-700">No transactions match current filters</p>
                    <p className="text-xs text-slate-400">Try clearing search keywords or switching category filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
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
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Status Bar (Per "Professional Polish" Mockup Design) */}
      <div className="mt-auto bg-slate-50 p-3.5 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span className="text-xs text-slate-500 font-medium">
          {filteredTransactions.length} transactions detected • Output YYYY-MM-DD format for Google Sheets
        </span>
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
};
