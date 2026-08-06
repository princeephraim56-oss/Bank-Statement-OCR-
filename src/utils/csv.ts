import { TransactionItem } from '../types';

/**
 * Extract 4-digit calendar year from a transaction item
 */
export function extractTransactionYear(t: TransactionItem): number {
  if (t.year && !isNaN(Number(t.year))) {
    return Number(t.year);
  }
  const dateStr = t.date || t.transactionDate || '';
  const match = dateStr.match(/\b(19\d\d|20\d\d)\b/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return new Date().getFullYear();
}

/**
 * Group and sort transactions by calendar year (descending by default)
 */
export function groupTransactionsByYear(transactions: TransactionItem[]): Map<number, TransactionItem[]> {
  const grouped = new Map<number, TransactionItem[]>();

  for (const tx of transactions) {
    const year = extractTransactionYear(tx);
    const list = grouped.get(year) || [];
    list.push({ ...tx, year });
    grouped.set(year, list);
  }

  // Sort transactions inside each year chronologically (newest first or oldest first)
  for (const [year, list] of grouped.entries()) {
    list.sort((a, b) => {
      const dateA = a.date || a.transactionDate || '';
      const dateB = b.date || b.transactionDate || '';
      return dateB.localeCompare(dateA);
    });
    grouped.set(year, list);
  }

  // Return Map sorted by year descending
  const sortedMap = new Map<number, TransactionItem[]>();
  const sortedYears = Array.from(grouped.keys()).sort((a, b) => b - a);
  for (const year of sortedYears) {
    sortedMap.set(year, grouped.get(year)!);
  }

  return sortedMap;
}

/**
 * Escape single field for CSV according to RFC 4180 rules
 */
export function escapeCsvField(field: string | number | undefined | null): string {
  if (field === undefined || field === null) return '""';
  const stringified = String(field);
  if (/[",\n\r]/.test(stringified)) {
    return `"${stringified.replace(/"/g, '""')}"`;
  }
  return stringified;
}

/**
 * Generate a single consolidated CSV file with transactions grouped and clearly separated by year.
 */
export function generateYearSeparatedCsv(transactions: TransactionItem[], hasMultipleFiles = false): string {
  if (transactions.length === 0) {
    return 'Date,Transaction Date,Amount,Category,Transaction Description,Notes,Source File\n';
  }

  const grouped = groupTransactionsByYear(transactions);
  const years = Array.from(grouped.keys());
  const lines: string[] = [];

  const headers = hasMultipleFiles
    ? ['Date', 'Transaction Date', 'Amount', 'Category', 'Transaction Description', 'Notes', 'Source Statement']
    : ['Date', 'Transaction Date', 'Amount', 'Category', 'Transaction Description', 'Notes'];

  // Single year case
  if (years.length <= 1) {
    lines.push(headers.join(','));
    const singleYearList = grouped.get(years[0]) || [];
    for (const t of singleYearList) {
      const row = [
        escapeCsvField(t.date || ''),
        escapeCsvField(t.transactionDate || t.date || ''),
        escapeCsvField(t.amount !== undefined ? t.amount.toFixed(2) : '0.00'),
        escapeCsvField(t.category || 'other'),
        escapeCsvField(t.description || ''),
        escapeCsvField(t.notes || '')
      ];
      if (hasMultipleFiles) {
        row.push(escapeCsvField(t.sourceFile || 'Statement'));
      }
      lines.push(row.join(','));
    }
    return lines.join('\n');
  }

  // Multi-year consolidated case: separate each year into marked sections
  years.forEach((year, index) => {
    const yearTransactions = grouped.get(year) || [];
    const totalDeposits = yearTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = yearTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const net = totalDeposits - totalExpenses;

    if (index > 0) {
      lines.push(''); // Blank line separator between years
    }

    lines.push(`# ============================================================`);
    lines.push(`# STATEMENT YEAR: ${year} (${yearTransactions.length} Transactions | Deposits: +${totalDeposits.toFixed(2)} | Expenses: -${totalExpenses.toFixed(2)} | Net: ${net >= 0 ? '+' : ''}${net.toFixed(2)})`);
    lines.push(`# ============================================================`);
    lines.push(headers.join(','));

    for (const t of yearTransactions) {
      const row = [
        escapeCsvField(t.date || ''),
        escapeCsvField(t.transactionDate || t.date || ''),
        escapeCsvField(t.amount !== undefined ? t.amount.toFixed(2) : '0.00'),
        escapeCsvField(t.category || 'other'),
        escapeCsvField(t.description || ''),
        escapeCsvField(t.notes || '')
      ];
      if (hasMultipleFiles) {
        row.push(escapeCsvField(t.sourceFile || 'Statement'));
      }
      lines.push(row.join(','));
    }
  });

  return lines.join('\n');
}

/**
 * Generate standard flat CSV string with optional Year column
 */
export function generateCsv(transactions: TransactionItem[], includeHeaders = true, includeYear = false, includeSource = false): string {
  const headers = [];
  if (includeYear) headers.push('Year');
  headers.push('Date', 'Transaction Date', 'Amount', 'Category', 'Transaction Description', 'Notes');
  if (includeSource) headers.push('Source Statement');

  const rows: string[] = [];

  if (includeHeaders) {
    rows.push(headers.join(','));
  }

  for (const t of transactions) {
    const year = extractTransactionYear(t);
    const row: string[] = [];
    if (includeYear) row.push(escapeCsvField(year));
    row.push(
      escapeCsvField(t.date || ''),
      escapeCsvField(t.transactionDate || t.date || ''),
      escapeCsvField(t.amount !== undefined ? t.amount.toFixed(2) : '0.00'),
      escapeCsvField(t.category || 'other'),
      escapeCsvField(t.description || ''),
      escapeCsvField(t.notes || '')
    );
    if (includeSource) row.push(escapeCsvField(t.sourceFile || ''));
    rows.push(row.join(','));
  }

  return rows.join('\n');
}

/**
 * Generate TSV (Tab Separated Values) format for direct copy-paste into Google Sheets & Excel
 * with year separation when multiple years are present.
 */
export function generateTsvForSheets(transactions: TransactionItem[], hasMultipleFiles = false): string {
  if (transactions.length === 0) {
    return 'Date\tTransaction Date\tAmount\tCategory\tTransaction Description\tNotes';
  }

  const grouped = groupTransactionsByYear(transactions);
  const years = Array.from(grouped.keys());
  const rows: string[] = [];

  const headers = hasMultipleFiles
    ? ['Date', 'Transaction Date', 'Amount', 'Category', 'Transaction Description', 'Notes', 'Source Statement']
    : ['Date', 'Transaction Date', 'Amount', 'Category', 'Transaction Description', 'Notes'];

  // Single year case
  if (years.length <= 1) {
    rows.push(headers.join('\t'));
    const singleYearList = grouped.get(years[0]) || [];
    for (const t of singleYearList) {
      const cleanDate = (t.date || '').replace(/[\t\r\n]/g, ' ');
      const cleanTxDate = (t.transactionDate || t.date || '').replace(/[\t\r\n]/g, ' ');
      const cleanAmount = t.amount !== undefined ? t.amount.toFixed(2) : '0.00';
      const cleanCategory = (t.category || 'other').replace(/[\t\r\n]/g, ' ');
      const cleanDesc = (t.description || '').replace(/[\t\r\n]/g, ' ');
      const cleanNotes = (t.notes || '').replace(/[\t\r\n]/g, ' ');
      const row = [cleanDate, cleanTxDate, cleanAmount, cleanCategory, cleanDesc, cleanNotes];
      if (hasMultipleFiles) {
        row.push((t.sourceFile || '').replace(/[\t\r\n]/g, ' '));
      }
      rows.push(row.join('\t'));
    }
    return rows.join('\n');
  }

  // Multi-year case: clean section blocks for Google Sheets
  years.forEach((year, index) => {
    const yearTransactions = grouped.get(year) || [];
    if (index > 0) {
      rows.push(''); // Blank row separating years in Google Sheets
    }
    rows.push(`>>> STATEMENT YEAR ${year} (${yearTransactions.length} TRANSACTIONS)`);
    rows.push(headers.join('\t'));

    for (const t of yearTransactions) {
      const cleanDate = (t.date || '').replace(/[\t\r\n]/g, ' ');
      const cleanTxDate = (t.transactionDate || t.date || '').replace(/[\t\r\n]/g, ' ');
      const cleanAmount = t.amount !== undefined ? t.amount.toFixed(2) : '0.00';
      const cleanCategory = (t.category || 'other').replace(/[\t\r\n]/g, ' ');
      const cleanDesc = (t.description || '').replace(/[\t\r\n]/g, ' ');
      const cleanNotes = (t.notes || '').replace(/[\t\r\n]/g, ' ');
      const row = [cleanDate, cleanTxDate, cleanAmount, cleanCategory, cleanDesc, cleanNotes];
      if (hasMultipleFiles) {
        row.push((t.sourceFile || '').replace(/[\t\r\n]/g, ' '));
      }
      rows.push(row.join('\t'));
    }
  });

  return rows.join('\n');
}

/**
 * Trigger single unified CSV file download in browser separated by year
 */
export function downloadCsvFile(
  transactions: TransactionItem[],
  filename = 'bank_transactions.csv',
  hasMultipleFiles = false
): void {
  const csvContent = generateYearSeparatedCsv(transactions, hasMultipleFiles);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to user clipboard with navigator fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
}

