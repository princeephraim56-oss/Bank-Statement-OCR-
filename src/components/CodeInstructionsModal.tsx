import React, { useState } from 'react';
import { X, Copy, Check, Code, Terminal, FileJson, Sparkles, BookOpen } from 'lucide-react';
import { copyToClipboard } from '../utils/csv';

interface CodeInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeInstructionsModal: React.FC<CodeInstructionsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'express' | 'system-prompt' | 'sheets'>('express');

  if (!isOpen) return null;

  const expressCodeSnippet = `// server.ts - Gemini 3.6 Flash Vision Bank Statement OCR Extraction API
import express from "express";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
app.use(express.json({ limit: "50mb" }));

// Initialize Gemini Client with User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { "User-Agent": "aistudio-build" }
  }
});

app.post("/api/extract", async (req, res) => {
  try {
    const { fileBase64, mimeType } = req.body;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        metadata: {
          type: Type.OBJECT,
          properties: {
            bankName: { type: Type.STRING },
            accountHolder: { type: Type.STRING },
            accountNumberMasked: { type: Type.STRING },
            statementPeriod: { type: Type.STRING },
            startingBalance: { type: Type.NUMBER },
            endingBalance: { type: Type.NUMBER }
          }
        },
        transactions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING, description: "YYYY-MM-DD" },
              transactionDate: { type: Type.STRING, description: "YYYY-MM-DD" },
              amount: { type: Type.NUMBER, description: "Positive for deposits, Negative for expenses" },
              category: { type: Type.STRING, description: "Auto category tag" },
              description: { type: Type.STRING },
              notes: { type: Type.STRING }
            },
            required: ["date", "amount", "description", "category"]
          }
        }
      },
      required: ["transactions"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType || "application/pdf", data: fileBase64 } },
          {
            text: \`Extract ALL transactions from this bank statement.
Rules:
1. Output format YYYY-MM-DD for Date and Transaction Date.
2. Positive numbers for deposits (+), Negative numbers for expenses (-).
3. Auto-detect category (groceries, food, fuel, transport, bills, gifts, salary, etc).
4. Skip headers, footers, and summary boxes.\`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1
      }
    });

    const parsed = JSON.parse(response.text);
    res.json({ success: true, data: parsed });

  } catch (err) {
    res.status(500).json({ error: "OCR extraction failed", details: err.message });
  }
});

app.listen(3000, () => console.log("Server listening on port 3000"));`;

  const systemPromptText = `You are a high-precision bank statement OCR parser and financial auditor.
Analyze this entire bank statement document (PDF or image). Extract EVERY SINGLE transaction line item across all pages.

CRITICAL RULES FOR EXTRACTION:
1. Extract ALL transactions. Do not omit any valid transaction row!
2. SKIP headers, footers, page numbers, daily balance summary tables, total summary boxes, disclaimers, interest rate disclosures, and check registers summary tables.
3. Date format: Convert all dates strictly to YYYY-MM-DD format (e.g. 2026-07-15). If the statement year is missing on individual line items, infer it from the statement header period or current year.
4. Transaction Date: Use transaction date if provided, otherwise fallback to posting date in YYYY-MM-DD.
5. Amount:
   - POSITIVE number (+) for deposits, credits, salary, transfers in, interest received, refunds.
   - NEGATIVE number (-) for expenses, debits, withdrawals, payments, fees, card purchases.
6. Category: Auto-detect category into one of: 'groceries', 'food', 'fuel', 'transport', 'bills', 'gifts', 'shopping', 'salary', 'transfer', 'income', 'utility', 'entertainment', 'healthcare', 'software', 'subscription', 'fees', 'other'.
7. Transaction Description: Provide a clean, readable transaction name or merchant description.
8. Notes: Provide concise context if present (e.g., check #, reference code, city/state, or memo).`;

  const handleCopy = async (code: string, key: string) => {
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopiedCode(key);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-3xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Extraction Code & Integration Instructions</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Sparkles className="w-3 h-3 inline mr-1" /> Gemini 3.6 Flash
                </span>
              </h2>
              <p className="text-xs text-slate-400">Node.js Express backend code, system prompts, and Google Sheets copy guide</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-5 pt-3 gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('express')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'express'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" /> Node.js Express Backend
          </button>
          <button
            onClick={() => setActiveTab('system-prompt')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'system-prompt'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileJson className="w-4 h-4" /> System Prompt & Rules
          </button>
          <button
            onClick={() => setActiveTab('sheets')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'sheets'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Google Sheets Setup
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          
          {activeTab === 'express' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Express API Endpoint Handler (`server.ts` using `@google/genai`)</span>
                <button
                  onClick={() => handleCopy(expressCodeSnippet, 'express')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1 transition-colors text-xs font-medium"
                >
                  {copiedCode === 'express' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'express' ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
                {expressCodeSnippet}
              </pre>
            </div>
          )}

          {activeTab === 'system-prompt' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>OCR Prompt & Category Extraction Instructions</span>
                <button
                  onClick={() => handleCopy(systemPromptText, 'prompt')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1 transition-colors text-xs font-medium"
                >
                  {copiedCode === 'prompt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'prompt' ? 'Copied!' : 'Copy Prompt'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
                {systemPromptText}
              </pre>
            </div>
          )}

          {activeTab === 'sheets' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <h4 className="text-sm font-bold text-white">How to Paste Directly into Google Sheets:</h4>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Click the <strong className="text-emerald-400">"Copy for Google Sheets"</strong> button on the transactions table. This copies tab-delimited text formatted specifically for spreadsheet grids.</li>
                <li>Open a new or existing spreadsheet in <strong>Google Sheets</strong> (or Microsoft Excel).</li>
                <li>Select cell <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300">A1</code> and press <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300">Ctrl + V</code> (or <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300">Cmd + V</code> on Mac).</li>
                <li>All columns (<code className="text-slate-200">Date</code>, <code className="text-slate-200">Transaction Date</code>, <code className="text-slate-200">Amount</code>, <code className="text-slate-200">Category</code>, <code className="text-slate-200">Transaction Description</code>, <code className="text-slate-200">Notes</code>) will split into individual spreadsheet columns automatically!</li>
              </ol>

              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-200 mt-4">
                <strong>💡 Tip:</strong> Because amounts are formatted as positive for deposits (<code className="text-emerald-300">+1000.00</code>) and negative for expenses (<code className="text-rose-300">-45.20</code>), you can run <code className="bg-emerald-900/80 px-1.5 py-0.5 rounded text-white font-mono">=SUM(C2:C100)</code> directly in Google Sheets to calculate your net ending balance!
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Powered by Gemini 3.6 Flash Vision OCR</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
