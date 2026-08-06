import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// High payload limit for handling base64 PDF and image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gemini OCR Extraction Endpoint
app.post('/api/extract', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Missing API Key',
        message: 'GEMINI_API_KEY environment variable is not configured. Please ensure your Gemini API key is configured in Settings > Secrets.'
      });
    }

    const { fileData, mimeType, fileName } = req.body;

    if (!fileData) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No file data provided.'
      });
    }

    // Clean base64 string if data URL prefix exists and detect true MIME type
    let cleanBase64 = fileData;
    let detectedMimeType = mimeType;

    if (typeof fileData === 'string' && fileData.startsWith('data:')) {
      const match = fileData.match(/^data:([^;]+);base64,(.+)$/s);
      if (match) {
        detectedMimeType = match[1] || detectedMimeType;
        cleanBase64 = match[2];
      } else if (fileData.includes(';base64,')) {
        cleanBase64 = fileData.split(';base64,')[1];
      }
    }

    // Infer MIME type if missing or octet-stream
    if (!detectedMimeType || detectedMimeType === 'application/octet-stream') {
      const lowerName = (fileName || '').toLowerCase();
      if (lowerName.endsWith('.pdf')) {
        detectedMimeType = 'application/pdf';
      } else if (lowerName.endsWith('.png')) {
        detectedMimeType = 'image/png';
      } else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
        detectedMimeType = 'image/jpeg';
      } else if (lowerName.endsWith('.webp')) {
        detectedMimeType = 'image/webp';
      } else {
        detectedMimeType = 'application/pdf';
      }
    }

    // Sanitize base64 string
    cleanBase64 = cleanBase64.replace(/\s+/g, '');

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
2. AUTOMATIC CURRENCY INFERENCE:
   - Carefully inspect the document's text, account headers, summary tables, balances, monetary column headers, and transaction descriptions to accurately infer the statement's true currency and currency symbol.
   - Look for printed currency symbols (such as $, €, £, ₦, C$, A$, ¥, ₹, R, CHF, GH₵, KSh, AED, etc.) or ISO currency codes (such as USD, EUR, GBP, NGN, CAD, AUD, JPY, INR, ZAR, GHS, KES, CHF, AED, SGD, etc.) or banking institution location context.
   - Set "currencyCode" (e.g. "USD", "EUR", "GBP", "NGN", "CAD", etc.) and "currencySymbol" (e.g. "$", "€", "£", "₦", "C$", etc.) based strictly on the uploaded document's visible contents.
   - DO NOT default to Nigerian Naira or any single currency unless the document specifically contains Nigerian bank names or Naira (₦ / NGN) markers.
3. SKIP headers, footers, page numbers, daily balance summary tables, total summary boxes, disclaimers, interest rate disclosures, and check registers summary tables.
4. Date format: Convert all dates strictly to YYYY-MM-DD format (e.g. 2026-07-15). If the statement year is missing on individual line items, infer it from the statement header period or current year.
5. Transaction Date: Use transaction date if provided, otherwise fallback to posting date in YYYY-MM-DD.
6. Amount:
   - POSITIVE number (+) for deposits, credits, salary, transfers in, interest received, refunds.
   - NEGATIVE number (-) for expenses, debits, withdrawals, payments, fees, card purchases.
   - Example: A purchase of 45.20 must be returned as -45.20. A deposit of 250,000 must be +250000.
7. Category: Auto-detect the category from transaction description into one of:
   'groceries', 'food', 'fuel', 'transport', 'bills', 'gifts', 'shopping', 'salary', 'transfer', 'income', 'utility', 'entertainment', 'healthcare', 'software', 'subscription', 'fees', 'other'.
8. Transaction Description: Provide a clean, readable transaction name or merchant description without trailing noise.
9. Notes: Provide concise context if present (e.g., check #, reference code, city/state, or memo).
10. Metadata: Extract bank name (e.g., Chase, Bank of America, Barclays, GTBank, Zenith Bank, Access Bank, Wells Fargo, etc.), account holder name, masked account number, statement period, and opening/closing balances if visible in the document.

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
            currency: { type: Type.STRING, description: "Inferred currency symbol or code (e.g. $, USD, ₦, NGN, £, GBP, €, EUR)" },
            currencyCode: { type: Type.STRING, description: "3-letter ISO currency code (e.g. USD, EUR, GBP, NGN, CAD, AUD, ZAR)" },
            currencySymbol: { type: Type.STRING, description: "The currency symbol identified from document (e.g. $, €, £, ₦, R, GH₵, KSh, ¥, ₹)" },
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

    // Resilient multi-model fallback chain
    // gemini-3.6-flash, gemini-3.1-flash-lite, and gemini-flash-latest have distinct quota and rate limits
    const candidateModels = ['gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let lastErrorMessage = 'Failed to extract transactions from document.';
    let isQuotaExceeded = false;
    let retryAfterSeconds = 0;
    let responseText: string | null = null;

    for (const modelName of candidateModels) {
      let attempts = 0;
      const maxAttempts = 2;

      while (attempts < maxAttempts) {
        attempts++;
        try {
          console.log(`[OCR] Attempting with model ${modelName} (attempt ${attempts}/${maxAttempts})...`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                inlineData: {
                  mimeType: detectedMimeType || 'application/pdf',
                  data: cleanBase64
                }
              },
              promptText
            ],
            config: {
              responseMimeType: 'application/json',
              responseSchema: responseSchema,
              temperature: 0.1
            }
          });

          if (response && response.text) {
            responseText = response.text;
            console.log(`[OCR] Successfully extracted content with ${modelName}`);
            break;
          }
        } catch (err: any) {
          const rawErrStr = String(err?.message || err || '');
          console.warn(`[OCR] Model ${modelName} attempt ${attempts} failed:`, rawErrStr);
          
          let parsedMsg = rawErrStr;
          try {
            const rawJson = typeof parsedMsg === 'string' && parsedMsg.startsWith('{') ? JSON.parse(parsedMsg) : null;
            if (rawJson?.error?.message) {
              parsedMsg = rawJson.error.message;
            }
          } catch {
            // Keep raw string
          }

          // Check if quota/rate limit error
          if (/resource_exhausted|quota|429|rate-limits/i.test(rawErrStr)) {
            isQuotaExceeded = true;
            const delayMatch = rawErrStr.match(/retry in ([0-9.]+)s/i) || rawErrStr.match(/retryDelay["\s:]+(\d+)s/i);
            if (delayMatch) {
              retryAfterSeconds = Math.max(retryAfterSeconds, Math.ceil(parseFloat(delayMatch[1])));
            } else if (!retryAfterSeconds) {
              retryAfterSeconds = 45;
            }
            lastErrorMessage = `Gemini API quota rate limit reached. Please wait ${retryAfterSeconds || 45} seconds before sending new documents.`;
            // Immediately break out of this model's retry loop to try the next candidate model
            break;
          }

          lastErrorMessage = parsedMsg;

          // Check for transient server errors (503 / fetch failed)
          const isTransient = /503|demand|UNAVAILABLE|fetch failed|ECONNRESET|ETIMEDOUT/i.test(rawErrStr);
          if (isTransient && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, attempts * 1500));
          } else {
            // Move to next candidate model immediately
            break;
          }
        }
      }

      if (responseText) {
        break;
      }
    }

    if (!responseText) {
      return res.status(isQuotaExceeded ? 429 : 500).json({
        success: false,
        isQuotaExceeded,
        retryAfterSeconds: retryAfterSeconds > 0 ? retryAfterSeconds : (isQuotaExceeded ? 45 : undefined),
        error: isQuotaExceeded ? 'Rate Limit Exceeded' : 'Extraction Failed',
        message: lastErrorMessage || 'Unable to process document with Gemini OCR.'
      });
    }

    let parsedResult: any;
    try {
      let cleaned = responseText.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      }
      parsedResult = JSON.parse(cleaned);
    } catch (parseErr: any) {
      console.error('JSON parsing failed:', parseErr, 'Raw response:', responseText);
      return res.status(500).json({
        success: false,
        error: 'Parsing Error',
        message: 'Unable to parse structured JSON from OCR response.'
      });
    }

    // Ensure IDs for every transaction
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

    res.json({
      success: true,
      fileName: fileName || 'statement',
      data: parsedResult
    });

  } catch (error: any) {
    console.error('OCR Extraction Error:', error);
    let cleanErr = error?.message || 'Failed to process document with Gemini Vision OCR.';
    try {
      const parsed = typeof cleanErr === 'string' && cleanErr.startsWith('{') ? JSON.parse(cleanErr) : null;
      if (parsed?.error?.message) cleanErr = parsed.error.message;
    } catch {
      // ignore
    }
    res.status(500).json({
      success: false,
      error: 'Extraction Failed',
      message: cleanErr
    });
  }
});

// Explicit API 404 handler for unmatched /api routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `API route ${req.method} ${req.path} does not exist.`
  });
});

// JSON Error Middleware to prevent Express from sending HTML errors for API requests
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Middleware Error]:', err);
  if (res.headersSent) {
    return next(err);
  }
  const statusCode = typeof err.status === 'number' ? err.status : 500;
  res.status(statusCode).json({
    success: false,
    error: err.name || 'Server Error',
    message: err.message || 'An error occurred during request execution.'
  });
});

// Start Express server and attach Vite middleware in dev mode
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
