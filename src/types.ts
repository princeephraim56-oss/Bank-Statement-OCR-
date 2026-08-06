export interface TransactionItem {
  id: string;
  date: string; // YYYY-MM-DD
  transactionDate: string; // YYYY-MM-DD
  amount: number; // positive = deposit, negative = expense
  category: string;
  description: string;
  notes: string;
  sourceFile?: string;
  year?: number;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale?: string;
}

export interface StatementMetadata {
  bankName?: string;
  accountHolder?: string;
  accountNumberMasked?: string;
  statementPeriod?: string;
  startingBalance?: number;
  endingBalance?: number;
  currency?: string;
  currencyCode?: string;
  currencySymbol?: string;
  totalDeposits?: number;
  totalWithdrawals?: number;
  pageCount?: number;
}

export interface ProcessedFileItem {
  id: string;
  fileName: string;
  fileSize: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  metadata?: StatementMetadata;
  transactions?: TransactionItem[];
  detectedYears?: number[];
}

export interface ExtractionResult {
  metadata: StatementMetadata;
  transactions: TransactionItem[];
  files?: ProcessedFileItem[];
  years?: number[];
  rawCsvText?: string;
}

export interface SampleBankStatement {
  id: string;
  name: string;
  description: string;
  accountType: string;
  itemCount: number;
  sampleData: ExtractionResult;
  fileBase64?: string;
  fileType?: string;
  fileName?: string;
  isMultiFile?: boolean;
  fileCount?: number;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)', locale: 'en-GB' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira (₦)', locale: 'en-NG' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar ($ CAD)', locale: 'en-CA' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar ($ AUD)', locale: 'en-AU' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)', locale: 'en-IN' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)', locale: 'ja-JP' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand (R)', locale: 'en-ZA' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi (GH₵)', locale: 'en-GH' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling (KSh)', locale: 'en-KE' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc (CHF)', locale: 'de-CH' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)', locale: 'ar-AE' },
  { code: 'SGD', symbol: '$', name: 'Singapore Dollar ($ SGD)', locale: 'en-SG' }
];


