export interface TransactionItem {
  id: string;
  date: string; // YYYY-MM-DD
  transactionDate: string; // YYYY-MM-DD
  amount: number; // positive = deposit, negative = expense
  category: string;
  description: string;
  notes: string;
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
