import { SampleBankStatement } from '../types';

export const SAMPLE_BANK_STATEMENTS: SampleBankStatement[] = [
  {
    id: 'checking-monthly',
    name: 'Standard Checking Account Statement',
    description: 'Monthly statement with salary deposit, utility bills, groceries, and card purchases.',
    accountType: 'Checking (...4892)',
    itemCount: 10,
    fileName: 'sample_checking_statement_july.pdf',
    fileType: 'application/pdf',
    sampleData: {
      metadata: {
        bankName: 'Apex First National Bank',
        accountHolder: 'Johnathan Miller',
        accountNumberMasked: '•••• •••• 4892',
        statementPeriod: '2026-07-01 to 2026-07-25',
        startingBalance: 4250.80,
        endingBalance: 7812.45,
        currency: 'USD',
        totalDeposits: 5200.00,
        totalWithdrawals: 1638.35,
        pageCount: 2
      },
      transactions: [
        {
          id: 'tx-1',
          date: '2026-07-01',
          transactionDate: '2026-06-30',
          amount: 5000.00,
          category: 'income',
          description: 'DIRECT DEPOSIT - TECH CORP SALARY PAYROLL',
          notes: 'Bi-weekly payroll credit'
        },
        {
          id: 'tx-2',
          date: '2026-07-02',
          transactionDate: '2026-07-01',
          amount: -145.20,
          category: 'bills',
          description: 'CITY ELECTRIC & WATER UTILITY AUTOPAY',
          notes: 'Auto-debit bill payment'
        },
        {
          id: 'tx-3',
          date: '2026-07-03',
          transactionDate: '2026-07-03',
          amount: -89.45,
          category: 'groceries',
          description: 'WHOLE FOODS MARKET #10492 SAN FRANCISCO CA',
          notes: 'POS Debit purchase'
        },
        {
          id: 'tx-4',
          date: '2026-07-05',
          transactionDate: '2026-07-04',
          amount: -45.00,
          category: 'fuel',
          description: 'SHELL OIL 57483920 SAN JOSE CA',
          notes: 'Unleaded fuel'
        },
        {
          id: 'tx-5',
          date: '2026-07-08',
          transactionDate: '2026-07-07',
          amount: -18.50,
          category: 'food',
          description: 'BLUE BOTTLE COFFEE BAY STREET',
          notes: 'Card payment'
        },
        {
          id: 'tx-6',
          date: '2026-07-12',
          transactionDate: '2026-07-11',
          amount: -120.00,
          category: 'transport',
          description: 'BAY AREA FAST TRAK TOLL AUTHORITY',
          notes: 'Account auto-replenish'
        },
        {
          id: 'tx-7',
          date: '2026-07-15',
          transactionDate: '2026-07-15',
          amount: 200.00,
          category: 'transfer',
          description: 'VENMO CASHOUT FROM SARAH M - DINNER SHARE',
          notes: 'P2P Transfer Credit'
        },
        {
          id: 'tx-8',
          date: '2026-07-18',
          transactionDate: '2026-07-17',
          amount: -64.99,
          category: 'subscription',
          description: 'COMCAST CABLE INTERNET HIGH SPEED',
          notes: 'Monthly subscription'
        },
        {
          id: 'tx-9',
          date: '2026-07-21',
          transactionDate: '2026-07-20',
          amount: -210.30,
          category: 'shopping',
          description: 'TARGET STORE #0882 MOUNTAIN VIEW CA',
          notes: 'Household items'
        },
        {
          id: 'tx-10',
          date: '2026-07-24',
          transactionDate: '2026-07-24',
          amount: -944.91,
          category: 'bills',
          description: 'STATE FARM INSURANCE MORTGAGE ESCROW',
          notes: 'Insurance premium'
        }
      ]
    }
  },
  {
    id: 'credit-card-statement',
    name: 'Business Rewards Credit Card Statement',
    description: 'Credit card PDF with software subscriptions, meals, gas, and vendor disbursements.',
    accountType: 'Credit Card (...8104)',
    itemCount: 8,
    fileName: 'business_cc_statement.png',
    fileType: 'image/png',
    sampleData: {
      metadata: {
        bankName: 'Capital Vantage Business Card',
        accountHolder: 'Apex Studio LLC',
        accountNumberMasked: '•••• •••• 8104',
        statementPeriod: '2026-06-15 to 2026-07-15',
        startingBalance: -1280.40,
        endingBalance: -2845.10,
        currency: 'USD',
        totalDeposits: 1280.40,
        totalWithdrawals: 2845.10,
        pageCount: 1
      },
      transactions: [
        {
          id: 'cc-1',
          date: '2026-06-16',
          transactionDate: '2026-06-15',
          amount: 1280.40,
          category: 'transfer',
          description: 'PAYMENT THANK YOU - ONLINE BANK TRANSFER',
          notes: 'Statement Balance Paid in Full'
        },
        {
          id: 'cc-2',
          date: '2026-06-18',
          transactionDate: '2026-06-18',
          amount: -299.00,
          category: 'software',
          description: 'AWS EMEA CLOUD HOSTING SERVICES',
          notes: 'Monthly infrastructure server charge'
        },
        {
          id: 'cc-3',
          date: '2026-06-22',
          transactionDate: '2026-06-21',
          amount: -450.00,
          category: 'gifts',
          description: 'APPLE STORE ONLINE GIFT CARD PURCHASES',
          notes: 'Team appreciation incentive'
        },
        {
          id: 'cc-4',
          date: '2026-06-25',
          transactionDate: '2026-06-24',
          amount: -168.40,
          category: 'food',
          description: 'MORTON STEAKHOUSE CLIENT DINNER SF',
          notes: 'Business meal & hospitality'
        },
        {
          id: 'cc-5',
          date: '2026-06-29',
          transactionDate: '2026-06-28',
          amount: -62.50,
          category: 'fuel',
          description: 'CHEVRON 009231 PALO ALTO CA',
          notes: 'Company car fuel'
        },
        {
          id: 'cc-6',
          date: '2026-07-02',
          transactionDate: '2026-07-01',
          amount: -1500.00,
          category: 'shopping',
          description: 'B&H PHOTO VIDEO PRO CAMERA EQUIPMENT',
          notes: 'Studio hardware upgrade'
        },
        {
          id: 'cc-7',
          date: '2026-07-08',
          transactionDate: '2026-07-07',
          amount: -215.20,
          category: 'healthcare',
          description: 'QUEST DIAGNOSTICS LAB HEALTH CHECK',
          notes: 'Executive health screening'
        },
        {
          id: 'cc-8',
          date: '2026-07-12',
          transactionDate: '2026-07-12',
          amount: -150.00,
          category: 'entertainment',
          description: 'CHAMBER SYMPHONY TICKETS EVENT',
          notes: 'Client networking event'
        }
      ]
    }
  }
];
