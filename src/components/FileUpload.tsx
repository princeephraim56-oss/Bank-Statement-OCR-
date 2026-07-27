import React, { useState, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, Sparkles, CheckCircle, AlertCircle, FileCheck, ArrowRight, Loader2 } from 'lucide-react';
import { SAMPLE_BANK_STATEMENTS } from '../data/sampleStatements';
import { SampleBankStatement } from '../types';

interface FileUploadProps {
  onProcessFile: (fileData: string, mimeType: string, fileName: string) => Promise<void>;
  onSelectSample: (sample: SampleBankStatement) => void;
  isLoading: boolean;
  error: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onProcessFile,
  onSelectSample,
  isLoading,
  error
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    file: File;
    previewUrl: string | null;
    base64: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    // Validate file type
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic'];
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a valid bank statement PDF or image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      let previewUrl: string | null = null;

      if (file.type.startsWith('image/')) {
        previewUrl = resultStr;
      }

      setSelectedFile({
        file,
        previewUrl,
        base64: resultStr
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) return;
    onProcessFile(
      selectedFile.base64,
      selectedFile.file.type || 'application/pdf',
      selectedFile.file.name
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Main Upload Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> High Precision Gemini 3.6 Flash Vision OCR
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight">Extract Bank Statement Transactions</h2>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                Upload multi-page PDFs or image statements. Auto-formats dates (YYYY-MM-DD), positive deposits, negative expenses, and categories into clean CSV tables for Google Sheets.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Container */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Dropzone Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !selectedFile && !isLoading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 scale-[1.005]'
                : selectedFile
                ? 'border-emerald-300 bg-emerald-50/20'
                : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,image/png,image/jpeg,image/jpg,image/webp,image/heic"
              className="hidden"
            />

            {!selectedFile ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-800">
                    Drag and drop your bank statement here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports Multi-page PDF, PNG, JPG, WEBP (Up to 50 MB)
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    Browse Files
                  </button>
                </div>
              </div>
            ) : (
              /* File Selected Preview */
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-4">
                  {selectedFile.previewUrl ? (
                    <img
                      src={selectedFile.previewUrl}
                      alt="Statement Preview"
                      className="w-14 h-14 object-cover rounded-lg border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-red-50 text-red-600 rounded-lg flex items-center justify-center border border-red-200">
                      <FileText className="w-7 h-7" />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-800 truncate max-w-xs sm:max-w-md">
                      {selectedFile.file.name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-medium text-emerald-600 flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5" /> Ready for OCR
                      </span>
                      <span>•</span>
                      <span>{(selectedFile.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                      <span>•</span>
                      <span className="uppercase">{selectedFile.file.name.split('.').pop()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    disabled={isLoading}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    Change File
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubmit();
                    }}
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Extracting OCR...</span>
                      </>
                    ) : (
                      <>
                        <span>Extract Transactions</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Loading Animation Status Bar */}
          {isLoading && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                  Gemini 3.6 Flash Vision scanning document...
                </span>
                <span>Parsing Multi-Page Table Data</span>
              </div>
              <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full w-2/3 animate-pulse rounded-full" />
              </div>
              <p className="text-xs text-emerald-700">
                Filtering headers, matching debit/credit columns, assigning categories, and formatting dates to YYYY-MM-DD.
              </p>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-rose-800 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">OCR Processing Error</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Sample Bank Statement Quick Launch Pills */}
          <div className="border-t border-slate-100 pt-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Or Instant Demo (1-Click Sample Statements):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SAMPLE_BANK_STATEMENTS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => onSelectSample(sample)}
                  disabled={isLoading}
                  className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 group-hover:text-emerald-600 group-hover:border-emerald-200 shadow-2xs">
                      {sample.fileType?.includes('pdf') ? (
                        <FileText className="w-5 h-5" />
                      ) : (
                        <ImageIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-950">
                        {sample.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {sample.accountType} • {sample.itemCount} Line Items
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                    Load →
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Feature Specs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs">
            <CheckCircle className="w-4 h-4" />
            <span>Structured Standardized CSV</span>
          </div>
          <p className="text-xs text-slate-600">
            Strict YYYY-MM-DD date formatting, positive deposits (+), negative expenses (-), and automated category tags.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs">
            <CheckCircle className="w-4 h-4" />
            <span>Multi-Page PDF Ready</span>
          </div>
          <p className="text-xs text-slate-600">
            Scans multi-page bank statements completely, skipping running balances, summaries, headers, and disclosures.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs">
            <CheckCircle className="w-4 h-4" />
            <span>1-Click Google Sheets Paste</span>
          </div>
          <p className="text-xs text-slate-600">
            Copy tab-delimited grid data directly to clipboard for immediate 1-second paste into Google Sheets or Excel.
          </p>
        </div>
      </div>

    </div>
  );
};
