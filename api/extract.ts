import { GoogleGenAI, Type } from '@google/genai';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default async function handler(req: any, res: any) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed', message: 'Only POST is supported' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Missing API Key',
        message: 'GEMINI_API_KEY environment variable is not configured. Please add it to your environment variables.'
      });
    }

    const { fileData, mimeType, fileName } = req.body || {};

    if (!fileData) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No file data provided.'
      });
    }

    // Clean base64 prefix if present
    let cleanBase64 = fileData;
    if (typeof fileData === 'string' && fileData.includes(';base64,')) {
      cleanBase64 = fileData.split(';base64,')[1];
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const promptText = `You are a high-precision bank statement OCR parser and financial auditor.
Analyze this entire bank statement document (PDF or image). Extract EVERY SINGLE transaction line item across all pages.

CRITICAL RULES FOR EXTRACTION:
1. Extract ALL transactions. Do not omit any valid transaction row!
2. Detect Nigerian Naira (₦ / NGN) statements as well as USD ($), GBP (£), EUR (€), etc. Set the currency field in metadata accordingly (default to NGN / ₦ if in Nigeria or when Naira symbols appear).
3. SKIP headers, footers, page numbers, daily balance summary tables, total summary boxes, disclaimers, interest rate disclosures, and check registers summary tables.
4. Date format: Convert all dates strictly to YYYY-MM-DD format (e.g. 2026-07-15). If the statement year is missing on individual line items, infer it from the statement header period or current year.
5. Transaction Date: Use transaction date if provided, otherwise fallback to posting date in YYYY-MM-DD.
6. Amount:
   - POSITIVE number (+) for deposits, credits, salary, transfers in, interest received, refunds.
   - NEGATIVE number (-) for expenses, debits, withdrawals, payments, fees, card purchases.
   - Example: A purchase of 45,200 must be returned as -45200. A deposit of 250,000 must be +250000.
7. Category: Auto-detect the category from transaction description into one of:
   'groceries', 'food', 'fuel', 'transport', 'bills', 'gifts', 'shopping', 'salary', 'transfer', 'income', 'utility', 'entertainment', 'healthcare', 'software', 'subscription', 'fees', 'other'.
8. Transaction Description: Provide a clean, readable transaction name or merchant description without trailing noise.
9. Notes: Provide concise context if present (e.g., check #, reference code, city/state, or memo).
10. Metadata: Extract bank name (e.g., GTBank, Zenith Bank, Access Bank, First Bank, Chase, etc.), account holder name, masked account number, statement period, and opening/closing balances if visible in the document.

Output MUST be valid JSON matching the requested response schema.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        metadata: {
          type: Type.OBJECT,
          properties: {
            bankName: { type: Type.STRING, description: "Financial institution name" },
            accountHolder: { type: Type.STRING, description: "Account holder name" },
            accountNumberMasked: { type: Type.STRING, description: "Masked account number, e.g. ...4892" },
            statementPeriod: { type: Type.STRING, description: "Statement date range" },
            startingBalance: { type: Type.NUMBER, description: "Opening balance" },
            endingBalance: { type: Type.NUMBER, description: "Closing balance" },
            currency: { type: Type.STRING, description: "Currency symbol or code (e.g. ₦, NGN, $, USD)" },
            totalDeposits: { type: Type.NUMBER, description: "Total deposit sum" },
            totalWithdrawals: { type: Type.NUMBER, description: "Total withdrawal sum" },
            pageCount: { type: Type.NUMBER, description: "Total pages processed" }
          }
        },
        transactions: {
          type: Type.ARRAY,
          description: "All extracted transaction rows",
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING, description: "Posting Date YYYY-MM-DD" },
              transactionDate: { type: Type.STRING, description: "Transaction Date YYYY-MM-DD" },
              amount: { type: Type.NUMBER, description: "Amount: Positive for deposits, Negative for expenses" },
              category: { type: Type.STRING, description: "Auto category" },
              description: { type: Type.STRING, description: "Transaction description" },
              notes: { type: Type.STRING, description: "Notes or memo" }
            },
            required: ["date", "amount", "description", "category"]
          }
        }
      },
      required: ["transactions"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'application/pdf',
              data: cleanBase64
            }
          },
          {
            text: promptText
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.1
      }
    });

    const responseText = response.text;
    if (!responseText) {
      return res.status(500).json({
        error: 'Extraction Error',
        message: 'No response text received from Gemini API.'
      });
    }

    const parsedResult = JSON.parse(responseText);

    if (parsedResult.transactions && Array.isArray(parsedResult.transactions)) {
      parsedResult.transactions = parsedResult.transactions.map((t: any, idx: number) => ({
        id: `tx-${Date.now()}-${idx + 1}`,
        date: t.date || new Date().toISOString().split('T')[0],
        transactionDate: t.transactionDate || t.date || new Date().toISOString().split('T')[0],
        amount: typeof t.amount === 'number' ? t.amount : parseFloat(t.amount || '0'),
        category: (t.category || 'other').toLowerCase(),
        description: t.description || 'Unlabeled Transaction',
        notes: t.notes || ''
      }));
    } else {
      parsedResult.transactions = [];
    }

    if (!parsedResult.metadata) {
      parsedResult.metadata = {};
    }

    return res.status(200).json({
      success: true,
      fileName: fileName || 'statement',
      data: parsedResult
    });

  } catch (error: any) {
    console.error('Vercel API Extraction Error:', error);
    return res.status(500).json({
      error: 'Extraction Failed',
      message: error?.message || 'Failed to process document with Gemini 3.6 Flash Vision OCR.'
    });
  }
}
