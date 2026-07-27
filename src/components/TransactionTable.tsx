import React, { useState } from 'react';
import { TransactionItem } from '../types';
import { 
  Download, Copy, Check, Search, Plus, Trash2, Edit3, 
  ArrowUpDown, Filter, Sparkles, FileSpreadsheet, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { downloadCsvFile, copyToClipboard, generateTsvForSheets } from '../utils/csv';

interface TransactionTableProps {
  transactions: TransactionItem[];
  onUpdateTransactions: (updated: TransactionItem[]) => void;
}

const CATEGORY_PILLS: Record<string, string> = {
  groceries: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  food: 'bg-amber-50 text-amber-700 border-amber-200',
  fuel: 'bg-orange-50 text-orange-700 border-orange-200',
  transport: 'bg-blue-50 text-blue-700 border-blue-200',
  bills: 'bg-rose-50 text-rose-700 border-rose-200',
  gifts: 'bg-purple-50 text-purple-700 border-purple-200',
  shopping: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  salary: 'bg-teal-50 text-teal-700 border-teal-200',
  income: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  transfer: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  utility: 'bg-rose-50 text-rose-700 border-rose-200',
  entertainment: 'bg-pink-50 text-pink-700 border-pink-200',
  healthcare: 'bg-sky-50 text-sky-700 border-sky-200',
  software: 'bg-violet-50 text-violet-700 border-violet-200',
  subscription: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  fees: 'bg-red-50 text-red-700 border-red-200',
  other: 'bg-slate-100 text-slate-700 border-slate-200'
};

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onUpdateTransactions
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
      const matchNotes = t.notes.toLowerCase().includes(term);
      const matchCat = t.category.toLowerCase().includes(term);
      const matchDate = t.date.includes(term) || t.transactionDate.includes(term);
      const matchAmt = t.amount.toString().includes(term);
      return matchDesc || matchNotes || matchCat || matchDate || matchAmt;
    }

    return true;
  });

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
    downloadCsvFile(filteredTransactions, `bank_statement_ocr_${new Date().toISOString().slice(0,10)}.csv`);
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
    if (confirm('Delete this transaction row?')) {
      onUpdateTransactions(transactions.filter(t => t.id !== id));
    }
  };

  // Add New Manual Row
  const handleAddRow = () => {
    const newRow: TransactionItem = {
      id: `tx-manual-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      transactionDate: new Date().toISOString().slice(0, 10),
      amount: -25.00,
      category: 'other',
      description: 'New Transaction',
      notes: 'Manually added'
    };
    onUpdateTransactions([newRow, ...transactions]);
    startEditing(newRow);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
      
      {/* Table Action Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
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

          {/* Type Filter Buttons */}
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

        {/* Action Buttons: Google Sheets Paste & Download CSV */}
        <div className="flex items-center space-x-2">
          
          <button
            onClick={handleAddRow}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors border border-slate-300"
            title="Add a manual transaction row"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Row</span>
          </button>

          {/* COPY FOR GOOGLE SHEETS BUTTON */}
          <button
            onClick={handleCopyForSheets}
            className={`px-4 py-2 text-xs font-bold rounded-lg shadow-sm flex items-center space-x-2 transition-all ${
              copied
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            title="Copy formatted grid to clipboard for direct Google Sheets paste"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied for Google Sheets!</span>
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
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors"
            title="Download CSV spreadsheet file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download CSV</span>
          </button>

        </div>

      </div>

      {/* Main Table Container */}
      <div className="overflow-x-auto min-h-[350px]">
        <table className="w-full text-left text-xs border-collapse">
          
          {/* Table Header */}
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-32">Date</th>
              <th className="py-3 px-4 w-32">Tx Date</th>
              <th className="py-3 px-4 w-32 text-right">Amount ($)</th>
              <th className="py-3 px-4 w-36">Category</th>
              <th className="py-3 px-4">Transaction Description</th>
              <th className="py-3 px-4">Notes</th>
              <th className="py-3 px-4 w-20 text-center">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200/80 text-slate-800">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Filter className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No transactions match current search/filter</p>
                    <p className="text-xs text-slate-400">Try clearing the search box or changing category filter</p>
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
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isEditing ? 'bg-amber-50/50' : isDeposit ? 'bg-emerald-50/10' : ''
                    }`}
                  >
                    {/* Date */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
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

                    {/* Transaction Date */}
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
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
                    <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.amount !== undefined ? editForm.amount : ''}
                          onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })}
                          className="w-24 bg-white border border-amber-300 rounded px-1.5 py-1 text-xs text-right"
                        />
                      ) : (
                        <span className={isDeposit ? 'text-emerald-600' : 'text-slate-900'}>
                          {isDeposit ? '+' : ''}${tx.amount.toFixed(2)}
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.category || ''}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value.toLowerCase() })}
                          className="w-full bg-white border border-amber-300 rounded px-1.5 py-1 text-xs"
                        />
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${categoryClass}`}>
                          {tx.category || 'other'}
                        </span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full bg-white border border-amber-300 rounded px-1.5 py-1 text-xs"
                        />
                      ) : (
                        tx.description
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-4 text-slate-500">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.notes || ''}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          className="w-full bg-white border border-amber-300 rounded px-1.5 py-1 text-xs"
                        />
                      ) : (
                        tx.notes || <span className="text-slate-300 italic">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {isEditing ? (
                        <button
                          onClick={() => saveEditing(tx.id)}
                          className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                          title="Save changes"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => startEditing(tx)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                            title="Edit row"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRow(tx.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
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

      {/* Table Footer Summary Bar */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
        <div>
          Showing <span className="font-bold text-slate-800">{filteredTransactions.length}</span> of{' '}
          <span className="font-bold text-slate-800">{transactions.length}</span> total rows
        </div>
        <div className="flex items-center space-x-4">
          <span>
            Net Visible Flow:{' '}
            <strong className="font-mono text-slate-900">
              ${filteredTransactions.reduce((acc, t) => acc + t.amount, 0).toFixed(2)}
            </strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-700 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Ready for Google Sheets paste
          </span>
        </div>
      </div>

    </div>
  );
};
