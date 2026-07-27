import { TransactionItem } from '../types';

/**
 * Escape single field for CSV according to RFC 4180 rules
 */
export function escapeCsvField(field: string | number | undefined | null): string {
  if (field === undefined || field === null) return '""';
  const stringified = String(field);
  // If string contains comma, double quote, or newline, wrap in quotes and escape quotes
  if (/[",\n\r]/.test(stringified)) {
    return `"${stringified.replace(/"/g, '""')}"`;
  }
  return stringified;
}

/**
 * Generate standard CSV string ready for download or copying
 */
export function generateCsv(transactions: TransactionItem[], includeHeaders = true): string {
  const headers = ['Date', 'Transaction Date', 'Amount', 'Category', 'Transaction Description', 'Notes'];
  const rows: string[] = [];

  if (includeHeaders) {
    rows.push(headers.join(','));
  }

  for (const t of transactions) {
    const row = [
      escapeCsvField(t.date || ''),
      escapeCsvField(t.transactionDate || t.date || ''),
      escapeCsvField(t.amount !== undefined ? t.amount.toFixed(2) : '0.00'),
      escapeCsvField(t.category || 'other'),
      escapeCsvField(t.description || ''),
      escapeCsvField(t.notes || '')
    ];
    rows.push(row.join(','));
  }

  return rows.join('\n');
}

/**
 * Generate TSV (Tab Separated Values) format for direct copy-paste into Google Sheets & Excel
 */
export function generateTsvForSheets(transactions: TransactionItem[], includeHeaders = true): string {
  const headers = ['Date', 'Transaction Date', 'Amount', 'Category', 'Transaction Description', 'Notes'];
  const rows: string[] = [];

  if (includeHeaders) {
    rows.push(headers.join('\t'));
  }

  for (const t of transactions) {
    // Replace tabs/newlines in fields for clean TSV grid paste
    const cleanDate = (t.date || '').replace(/[\t\r\n]/g, ' ');
    const cleanTxDate = (t.transactionDate || t.date || '').replace(/[\t\r\n]/g, ' ');
    const cleanAmount = t.amount !== undefined ? t.amount.toFixed(2) : '0.00';
    const cleanCategory = (t.category || 'other').replace(/[\t\r\n]/g, ' ');
    const cleanDesc = (t.description || '').replace(/[\t\r\n]/g, ' ');
    const cleanNotes = (t.notes || '').replace(/[\t\r\n]/g, ' ');

    rows.push([cleanDate, cleanTxDate, cleanAmount, cleanCategory, cleanDesc, cleanNotes].join('\t'));
  }

  return rows.join('\n');
}

/**
 * Trigger standard CSV file download in browser
 */
export function downloadCsvFile(transactions: TransactionItem[], filename = 'bank_transactions.csv'): void {
  const csvContent = generateCsv(transactions, true);
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
