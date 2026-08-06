export interface TransactionItem {
  id: string;
  date: string; // YYYY-MM-DD
  transactionDate: string; // YYYY-MM-DD
  amount: number; // positive = deposit, negative = expense
  category: string;
  description: string;
  notes: string;
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
  totalDeposits?: number;
  totalWithdrawals?: number;
  pageCount?: number;
}

export interface ExtractionResult {
  metadata: StatementMetadata;
  transactions: TransactionItem[];
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
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira (₦)', locale: 'en-NG' },
  { code: 'USD', symbol: '$', name: 'US Dollar ($)', locale: 'en-US' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)', locale: 'en-GB' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)', locale: 'de-DE' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar ($ CAD)', locale: 'en-CA' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi (GH₵)', locale: 'en-GH' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling (KSh)', locale: 'en-KE' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand (R)', locale: 'en-ZA' }
];

