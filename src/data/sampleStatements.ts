import { SampleBankStatement } from '../types';

export const SAMPLE_BANK_STATEMENTS: SampleBankStatement[] = [
  {
    id: 'gtbank-naira-current',
    name: 'GTBank Nigeria - Naira Current Statement',
    description: 'Guaranty Trust Bank monthly statement with salary credit, NIP transfers, POS payments, DSTV, and utilities.',
    accountType: 'GTBank Current (•••4892)',
    itemCount: 10,
    fileName: 'GTBank_Statement_Naira_July2026.pdf',
    fileType: 'application/pdf',
    sampleData: {
      metadata: {
        bankName: 'Guaranty Trust Bank (GTBank) Nigeria',
        accountHolder: 'Chinedu Adeleke Okafor',
        accountNumberMasked: '012 •••• 4892',
        statementPeriod: '01-JUL-2026 to 31-JUL-2026',
        startingBalance: 1250000.00,
        endingBalance: 2943200.00,
        currency: 'NGN',
        currencyCode: 'NGN',
        currencySymbol: '₦',
        totalDeposits: 2850000.00,
        totalWithdrawals: 1156800.00,
        pageCount: 2
      },
      transactions: [
        {
          id: 'ng-1',
          date: '2026-07-02',
          transactionDate: '2026-07-02',
          amount: 2500000.00,
          category: 'salary',
          description: 'NIP/PAYSTACK/SALARY PAYROLL/JULY 2026 TECH VENTURES',
          notes: 'Monthly corporate salary credit'
        },
        {
          id: 'ng-2',
          date: '2026-07-04',
          transactionDate: '2026-07-03',
          amount: -45000.00,
          category: 'fuel',
          description: 'POS/TOTALENERGIES LEKKI PHASE 1 LAGOS NG',
          notes: 'Fuel purchase - PMS 50 Litres'
        },
        {
          id: 'ng-3',
          date: '2026-07-06',
          transactionDate: '2026-07-06',
          amount: -128500.00,
          category: 'groceries',
          description: 'POS/SHOPRITE IKEJA CITY MALL LAGOS',
          notes: 'Household grocery shopping'
        },
        {
          id: 'ng-4',
          date: '2026-07-08',
          transactionDate: '2026-07-08',
          amount: -35000.00,
          category: 'bills',
          description: 'MB/EKEDC POSTPAID ELECTRICITY BILL IKEJA DISCO',
          notes: 'Utility bill token settlement'
        },
        {
          id: 'ng-5',
          date: '2026-07-11',
          transactionDate: '2026-07-10',
          amount: -29000.00,
          category: 'subscription',
          description: 'MULTICHOICE DSTV PREMIUM SUBSCRIPTION NG',
          notes: 'Monthly TV entertainment renewal'
        },
        {
          id: 'ng-6',
          date: '2026-07-14',
          transactionDate: '2026-07-14',
          amount: 350000.00,
          category: 'income',
          description: 'NIP/FLUTTERWAVE/CONSULTING INVOICE 1092 EMERALD LABS',
          notes: 'Freelance UX sprint milestone payment'
        },
        {
          id: 'ng-7',
          date: '2026-07-18',
          transactionDate: '2026-07-17',
          amount: -18500.00,
          category: 'transport',
          description: 'UBER * RIDES LAGOS ISLAND TO AIRPORT',
          notes: 'Airport business transit'
        },
        {
          id: 'ng-8',
          date: '2026-07-22',
          transactionDate: '2026-07-22',
          amount: -50000.00,
          category: 'bills',
          description: 'MTN DATA & FIBRE INTERNET 200GB BROADBAND',
          notes: 'Home office internet subscription'
        },
        {
          id: 'ng-9',
          date: '2026-07-26',
          transactionDate: '2026-07-25',
          amount: -850000.00,
          category: 'transfer',
          description: 'TRF/COWRYWISE INVESTMENT SAVINGS VAULT DEPOSIT',
          notes: 'Automated high-yield savings allocation'
        },
        {
          id: 'ng-10',
          date: '2026-07-29',
          transactionDate: '2026-07-29',
          amount: -800.00,
          category: 'fees',
          description: 'GTB SMS NOTIFICATION & MONTHLY ACCOUNT MAINTENANCE FEE',
          notes: 'Standard banking levy'
        }
      ]
    }
  },
  {
    id: 'zenith-corporate-naira',
    name: 'Zenith Bank Nigeria - Corporate Business Account',
    description: 'Zenith Bank corporate statement with client vendor settlements, AWS cloud payments, and office expenses.',
    accountType: 'Zenith Corporate (•••9102)',
    itemCount: 8,
    fileName: 'Zenith_Corporate_Naira_Statement.pdf',
    fileType: 'application/pdf',
    sampleData: {
      metadata: {
        bankName: 'Zenith Bank PLC Nigeria',
        accountHolder: 'PrimeLogic Solutions Ltd',
        accountNumberMasked: '101 •••• 9102',
        statementPeriod: '01-JUL-2026 to 25-JUL-2026',
        startingBalance: 4800000.00,
        endingBalance: 8250000.00,
        currency: 'NGN',
        currencyCode: 'NGN',
        currencySymbol: '₦',
        totalDeposits: 5400000.00,
        totalWithdrawals: 1950000.00,
        pageCount: 1
      },
      transactions: [
        {
          id: 'zn-1',
          date: '2026-07-03',
          transactionDate: '2026-07-03',
          amount: 4500000.00,
          category: 'income',
          description: 'NIP/ACCESS/ENTERPRISE SOFTWARE CONTRACT PAYMENT MILESTONE 1',
          notes: 'Client quarterly retainer'
        },
        {
          id: 'zn-2',
          date: '2026-07-07',
          transactionDate: '2026-07-06',
          amount: -450000.00,
          category: 'software',
          description: 'CARD/AWS EMEA CLOUD SERVERS LAGOS POP',
          notes: 'Server infrastructure & hosting bill'
        },
        {
          id: 'zn-3',
          date: '2026-07-10',
          transactionDate: '2026-07-10',
          amount: 900000.00,
          category: 'income',
          description: 'INTERSWITCH WEB-PAY MERCHANT SETTLEMENT REF #883920',
          notes: 'Online checkout receipts batch'
        },
        {
          id: 'zn-4',
          date: '2026-07-12',
          transactionDate: '2026-07-12',
          amount: -320000.00,
          category: 'shopping',
          description: 'POS/SLOT SYSTEMS COMPUTERS & ACCESSORIES IKEJA',
          notes: 'New developer monitor and peripherals'
        },
        {
          id: 'zn-5',
          date: '2026-07-15',
          transactionDate: '2026-07-15',
          amount: -180000.00,
          category: 'food',
          description: 'POS/OCEAN BASKET VICTORIA ISLAND CLIENT EXECUTIVE LUNCH',
          notes: 'Client partner hospitality'
        },
        {
          id: 'zn-6',
          date: '2026-07-19',
          transactionDate: '2026-07-18',
          amount: -750000.00,
          category: 'bills',
          description: 'NIP/LEKKI COMMERCIAL REAL ESTATE OFFICE SERVICE CHARGE',
          notes: 'Quarterly facility management fee'
        },
        {
          id: 'zn-7',
          date: '2026-07-22',
          transactionDate: '2026-07-22',
          amount: -248000.00,
          category: 'transport',
          description: 'AIR PEACE FLIGHT ABUJA TO LAGOS BOARD MEETING',
          notes: 'Executive flight tickets'
        },
        {
          id: 'zn-8',
          date: '2026-07-25',
          transactionDate: '2026-07-25',
          amount: -2000.00,
          category: 'fees',
          description: 'ZENITH CORPORATE E-TOKEN & NIP TRANSFER LEVY',
          notes: 'Electronic banking transaction duties'
        }
      ]
    }
  },
  {
    id: 'access-bank-naira-savings',
    name: 'Access Bank Nigeria - Diamond Extra Savings',
    description: 'Access Bank savings statement with personal deposits, ATM withdrawals, airtime top-ups, and POS debit.',
    accountType: 'Access Savings (•••3145)',
    itemCount: 6,
    fileName: 'Access_Bank_Savings_Statement.png',
    fileType: 'image/png',
    sampleData: {
      metadata: {
        bankName: 'Access Bank PLC Nigeria',
        accountHolder: 'Amara Ngozi Eze',
        accountNumberMasked: '003 •••• 3145',
        statementPeriod: '01-JUL-2026 to 20-JUL-2026',
        startingBalance: 450000.00,
        endingBalance: 815000.00,
        currency: 'NGN',
        currencyCode: 'NGN',
        currencySymbol: '₦',
        totalDeposits: 500000.00,
        totalWithdrawals: 135000.00,
        pageCount: 1
      },
      transactions: [
        {
          id: 'ac-1',
          date: '2026-07-02',
          transactionDate: '2026-07-02',
          amount: 500000.00,
          category: 'transfer',
          description: 'NIP/KUDA/SAVINGS CONTRIBUTION FROM AMARA',
          notes: 'Personal account deposit'
        },
        {
          id: 'ac-2',
          date: '2026-07-05',
          transactionDate: '2026-07-05',
          amount: -40000.00,
          category: 'transfer',
          description: 'ATM WITHDRAWAL CASH ACCESS BANK SURULERE BRANCH',
          notes: 'Self ATM cash withdrawal'
        },
        {
          id: 'ac-3',
          date: '2026-07-09',
          transactionDate: '2026-07-08',
          amount: -35000.00,
          category: 'shopping',
          description: 'POS/SPAR NIGERIA LEKKI EXPRESSWAY LAGOS',
          notes: 'Departmental store purchase'
        },
        {
          id: 'ac-4',
          date: '2026-07-12',
          transactionDate: '2026-07-12',
          amount: -10000.00,
          category: 'bills',
          description: 'ACCESS MOBILE AIRTIME RECHARGE MTN 0803XXXXXXX',
          notes: 'Airtime & data top up'
        },
        {
          id: 'ac-5',
          date: '2026-07-16',
          transactionDate: '2026-07-15',
          amount: -48000.00,
          category: 'healthcare',
          description: 'POS/MEDPLUS PHARMACY ADMIRALTY WAY LEKKI',
          notes: 'Prescription wellness purchase'
        },
        {
          id: 'ac-6',
          date: '2026-07-20',
          transactionDate: '2026-07-20',
          amount: -2000.00,
          category: 'food',
          description: 'POS/KFC ADELABU SURULERE LAGOS',
          notes: 'Fast food meal purchase'
        }
      ]
    }
  },
  {
    id: 'usd-international-statement',
    name: 'Chase Bank USA - USD Checking Statement ($)',
    description: 'United States Dollar checking statement with client wire payments, SaaS subscriptions, and Amazon orders.',
    accountType: 'Chase Total Checking (•••8104)',
    itemCount: 6,
    fileName: 'Chase_Bank_USD_Statement_July2026.pdf',
    fileType: 'application/pdf',
    sampleData: {
      metadata: {
        bankName: 'JPMorgan Chase Bank, N.A.',
        accountHolder: 'Alexander M. Wright',
        accountNumberMasked: '402 •••• 8104',
        statementPeriod: '2026-07-01 to 2026-07-25',
        startingBalance: 3450.00,
        endingBalance: 6120.00,
        currency: 'USD',
        currencyCode: 'USD',
        currencySymbol: '$',
        totalDeposits: 4200.00,
        totalWithdrawals: 1530.00,
        pageCount: 1
      },
      transactions: [
        {
          id: 'usd-1',
          date: '2026-07-03',
          transactionDate: '2026-07-02',
          amount: 4200.00,
          category: 'salary',
          description: 'DIRECT DEP - APEX CONSULTING LLC GLOBAL PAYROLL',
          notes: 'Direct deposit payroll'
        },
        {
          id: 'usd-2',
          date: '2026-07-08',
          transactionDate: '2026-07-08',
          amount: -299.00,
          category: 'software',
          description: 'GITHUB ENTERPRISE & COPILOT SUBSCRIPTION',
          notes: 'Developer tooling subscription'
        },
        {
          id: 'usd-3',
          date: '2026-07-12',
          transactionDate: '2026-07-11',
          amount: -650.00,
          category: 'software',
          description: 'OPENAI API & GOOGLE CLOUD AI COMPUTE TOKENS',
          notes: 'Cloud AI infrastructure billing'
        },
        {
          id: 'usd-4',
          date: '2026-07-16',
          transactionDate: '2026-07-15',
          amount: -125.00,
          category: 'entertainment',
          description: 'SPOTIFY FAMILY & APPLE ONE BUNDLE',
          notes: 'Digital media streaming subscriptions'
        },
        {
          id: 'usd-5',
          date: '2026-07-20',
          transactionDate: '2026-07-19',
          amount: -410.00,
          category: 'shopping',
          description: 'AMAZON.COM DIGITAL HARDWARE BOOKS & TECH ACCESSORIES',
          notes: 'Technical engineering reference books'
        },
        {
          id: 'usd-6',
          date: '2026-07-24',
          transactionDate: '2026-07-24',
          amount: -46.00,
          category: 'fees',
          description: 'CHASE MONTHLY SERVICE FEE',
          notes: 'Account maintenance fee'
        }
      ]
    }
  },
  {
    id: 'barclays-uk-gbp-statement',
    name: 'Barclays UK - British Pound Current Account (£)',
    description: 'UK British Pound statement with salary, Transport for London (TfL), Sainsbury groceries, and council tax.',
    accountType: 'Barclays Current (•••5521)',
    itemCount: 5,
    fileName: 'Barclays_UK_GBP_Statement.pdf',
    fileType: 'application/pdf',
    sampleData: {
      metadata: {
        bankName: 'Barclays Bank UK PLC',
        accountHolder: 'Oliver James Davies',
        accountNumberMasked: '20-00-00 •••• 5521',
        statementPeriod: '01-JUL-2026 to 28-JUL-2026',
        startingBalance: 2150.00,
        endingBalance: 4320.00,
        currency: 'GBP',
        currencyCode: 'GBP',
        currencySymbol: '£',
        totalDeposits: 3500.00,
        totalWithdrawals: 1330.00,
        pageCount: 1
      },
      transactions: [
        {
          id: 'gbp-1',
          date: '2026-07-01',
          transactionDate: '2026-07-01',
          amount: 3500.00,
          category: 'salary',
          description: 'BACS SALARY CREDIT ACME TECHNOLOGIES UK',
          notes: 'Monthly net salary'
        },
        {
          id: 'gbp-2',
          date: '2026-07-05',
          transactionDate: '2026-07-04',
          amount: -68.50,
          category: 'transport',
          description: 'TFL TRAVEL CH CONTACTLESS LONDON UNDERGROUND',
          notes: 'Commuter tube travel'
        },
        {
          id: 'gbp-3',
          date: '2026-07-10',
          transactionDate: '2026-07-09',
          amount: -142.30,
          category: 'groceries',
          description: 'SAINSBURYS SUPERMARKET LONDON SE1',
          notes: 'Weekly groceries'
        },
        {
          id: 'gbp-4',
          date: '2026-07-15',
          transactionDate: '2026-07-15',
          amount: -185.00,
          category: 'bills',
          description: 'SOUTHWARK COUNCIL TAX DIRECT DEBIT',
          notes: 'Monthly council tax'
        },
        {
          id: 'gbp-5',
          date: '2026-07-22',
          transactionDate: '2026-07-21',
          amount: -934.20,
          category: 'bills',
          description: 'STANDING ORDER RESIDENTIAL RENT PAYMENT',
          notes: 'Monthly property rent'
        }
      ]
    }
  },
  {
    id: 'deutsche-bank-eur-statement',
    name: 'Deutsche Bank - Euro Girokonto (€)',
    description: 'European Euro statement with consulting income, REWE groceries, DB Bahn travel, and telecom bills.',
    accountType: 'DB AktivKonto (•••7739)',
    itemCount: 5,
    fileName: 'Deutsche_Bank_EUR_Kontoauszug.pdf',
    fileType: 'application/pdf',
    sampleData: {
      metadata: {
        bankName: 'Deutsche Bank AG Frankfurt',
        accountHolder: 'Maximilian Schmidt',
        accountNumberMasked: 'DE89 5007 •••• 7739',
        statementPeriod: '01.07.2026 - 31.07.2026',
        startingBalance: 3200.00,
        endingBalance: 5890.00,
        currency: 'EUR',
        currencyCode: 'EUR',
        currencySymbol: '€',
        totalDeposits: 4500.00,
        totalWithdrawals: 1810.00,
        pageCount: 1
      },
      transactions: [
        {
          id: 'eur-1',
          date: '2026-07-02',
          transactionDate: '2026-07-02',
          amount: 4500.00,
          category: 'income',
          description: 'SEPA UEBERWEISUNG PROJEKT-HONORAR BERLIN DIGITAL',
          notes: 'Client invoice settlement'
        },
        {
          id: 'eur-2',
          date: '2026-07-06',
          transactionDate: '2026-07-05',
          amount: -124.80,
          category: 'groceries',
          description: 'REWE MARKT GMBH FILIALE FRANKFURT',
          notes: 'Supermarket purchase'
        },
        {
          id: 'eur-3',
          date: '2026-07-12',
          transactionDate: '2026-07-11',
          amount: -79.90,
          category: 'transport',
          description: 'DEUTSCHE BAHN TICKET FRANKFURT - MUENCHEN ICE',
          notes: 'Business train travel'
        },
        {
          id: 'eur-4',
          date: '2026-07-18',
          transactionDate: '2026-07-18',
          amount: -65.00,
          category: 'utility',
          description: 'TELEKOM DEUTSCHLAND GMBH GLASFASER INTERNET',
          notes: 'Fiber broadband subscription'
        },
        {
          id: 'eur-5',
          date: '2026-07-25',
          transactionDate: '2026-07-24',
          amount: -1540.30,
          category: 'bills',
          description: 'SEPA LASTSCHRIFT WOHNUNGSMIETE IMMOBILIEN GMBH',
          notes: 'Monthly apartment rent'
        }
      ]
    }
  }
];
