import React, { useState, useRef } from 'react';
import { 
  Upload, FileText, Image as ImageIcon, Sparkles, CheckCircle, 
  AlertCircle, FileCheck, ArrowRight, Loader2, X, Plus, Files, Calendar, RefreshCw
} from 'lucide-react';
import { SAMPLE_BANK_STATEMENTS } from '../data/sampleStatements';
import { SampleBankStatement } from '../types';

export interface StagedUploadFile {
  id: string;
  file: File;
  previewUrl: string | null;
  base64: string;
  sizeFormatted: string;
}

export interface BatchProgressInfo {
  currentFileIndex: number;
  totalFiles: number;
  currentFileName: string;
  stage?: string;
}

interface FileUploadProps {
  onProcessFiles: (files: { fileData: string; mimeType: string; fileName: string; fileSize: number }[]) => Promise<void>;
  onSelectSample: (sample: SampleBankStatement) => void;
  isLoading: boolean;
  batchProgress?: BatchProgressInfo | null;
  error: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onProcessFiles,
  onSelectSample,
  isLoading,
  batchProgress,
  error
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<StagedUploadFile[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFiles(Array.from(e.target.files));
    }
    // reset input so same file can be re-selected if removed
    if (e.target) e.target.value = '';
  };

  const processSelectedFiles = (files: File[]) => {
    setValidationError(null);
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic'];
    
    const validFiles: File[] = [];
    for (const f of files) {
      const isPdfByName = f.name.toLowerCase().endsWith('.pdf');
      if (validTypes.includes(f.type) || isPdfByName) {
        // Prevent adding duplicate by name and size
        if (!stagedFiles.some(existing => existing.file.name === f.name && existing.file.size === f.size)) {
          validFiles.push(f);
        }
      }
    }

    if (validFiles.length < files.length) {
      setValidationError('Some files were ignored because only PDFs and images (PNG, JPG, WEBP) are supported, or duplicates were omitted.');
    }

    if (validFiles.length === 0) return;

    // Read all files asynchronously to base64
    const newStagedList: StagedUploadFile[] = [];
    let completedCount = 0;

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const resultStr = reader.result as string;
        let previewUrl: string | null = null;
        if (file.type.startsWith('image/')) {
          previewUrl = resultStr;
        }

        newStagedList.push({
          id: `staged-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          previewUrl,
          base64: resultStr,
          sizeFormatted: formatFileSize(file.size)
        });

        completedCount++;
        if (completedCount === validFiles.length) {
          setStagedFiles(prev => [...prev, ...newStagedList]);
        }
      };
      reader.readAsDataURL(file);
    });
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemoveFile = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setStagedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleClearAll = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setStagedFiles([]);
    setValidationError(null);
  };

  const handleSubmit = () => {
    if (stagedFiles.length === 0 || isLoading) return;
    const payload = stagedFiles.map(item => ({
      fileData: item.base64,
      mimeType: item.file.type || 'application/pdf',
      fileName: item.file.name,
      fileSize: item.file.size
    }));
    onProcessFiles(payload);
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
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5" /> High Precision Gemini 3.6 Flash Vision OCR
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <Files className="w-3.5 h-3.5" /> Multi-File Upload & Auto Year Separation
                </span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">Multi-Statement OCR Extractor</h2>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                Upload one or multiple bank statement PDF files. OCR extracts every line item and automatically generates a <strong>single unified CSV file separated by the year</strong> of each bank statement.
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
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all cursor-pointer relative ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 scale-[1.005]'
                : stagedFiles.length > 0
                ? 'border-emerald-300 bg-emerald-50/15'
                : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,image/png,image/jpeg,image/jpg,image/webp,image/heic"
              multiple
              className="hidden"
            />

            {stagedFiles.length === 0 ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-800">
                    Drag and drop your bank statement PDF files here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports selecting <strong>multiple PDF files at once</strong> (or images PNG, JPG). Up to 50 MB per file.
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
                    Select PDF Statement Files
                  </button>
                </div>
              </div>
            ) : (
              /* Staged Files Queue View */
              <div className="space-y-4 text-left" onClick={(e) => e.stopPropagation()}>
                
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-800">
                      {stagedFiles.length} Bank Statement {stagedFiles.length === 1 ? 'File' : 'Files'} Staged
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      Ready for Batch OCR
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-2xs flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add More Statements</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      disabled={isLoading}
                      className="px-2.5 py-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Staged File Cards List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {stagedFiles.map((sf, index) => (
                    <div
                      key={sf.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:border-emerald-300 transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {sf.previewUrl ? (
                          <img
                            src={sf.previewUrl}
                            alt="Preview"
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center border border-red-200 shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate" title={sf.file.name}>
                            {sf.file.name}
                          </p>
                          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 mt-0.5">
                            <span>#{index + 1}</span>
                            <span>•</span>
                            <span>{sf.sizeFormatted}</span>
                            <span>•</span>
                            <span className="uppercase">{sf.file.name.split('.').pop()}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleRemoveFile(sf.id, e)}
                        disabled={isLoading}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50 shrink-0"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Submit Batch Action Bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Will extract and compile all transactions into a <strong>single CSV separated by year</strong>.
                  </p>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Extracting Statements...</span>
                      </>
                    ) : (
                      <>
                        <span>Extract {stagedFiles.length} Statement{stagedFiles.length > 1 ? 's' : ''} (Unified CSV)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* Validation Notice */}
          {validationError && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-lg">
              {validationError}
            </p>
          )}

          {/* Loading Animation & Batch Multi-File Status Bar */}
          {isLoading && (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                  {batchProgress ? (
                    <span>
                      Processing Statement {batchProgress.currentFileIndex} of {batchProgress.totalFiles}: <strong className="text-emerald-950">{batchProgress.currentFileName}</strong>
                    </span>
                  ) : (
                    <span>Gemini 3.6 Flash Vision scanning document...</span>
                  )}
                </span>
                <span className="font-bold text-emerald-800">
                  {batchProgress ? `${Math.round((batchProgress.currentFileIndex / batchProgress.totalFiles) * 100)}%` : 'Running OCR'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-emerald-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                  style={{
                    width: batchProgress
                      ? `${(batchProgress.currentFileIndex / batchProgress.totalFiles) * 100}%`
                      : '60%'
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-emerald-700">
                <span>Auto-categorizing debits/credits & inferring calendar years</span>
                <span>Generating unified year-separated tables</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start justify-between gap-3 text-rose-800 text-xs">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">OCR Processing Error</p>
                  <p className="mt-0.5 leading-relaxed">{error}</p>
                </div>
              </div>
              {stagedFiles.length > 0 && !isLoading && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          )}

          {/* Sample Bank Statement Quick Launch Presets */}
          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Instant Demo (1-Click Sample Statements):
              </p>
              <span className="text-[11px] text-emerald-600 font-medium">
                Includes Multi-Year Batch Demo
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SAMPLE_BANK_STATEMENTS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => onSelectSample(sample)}
                  disabled={isLoading}
                  className={`flex items-center justify-between p-3.5 rounded-xl text-left transition-all group disabled:opacity-50 ${
                    sample.isMultiFile
                      ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/50 border-2 border-emerald-400 shadow-sm hover:border-emerald-500'
                      : 'bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg border shadow-2xs ${
                      sample.isMultiFile
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white border-slate-200 text-slate-600 group-hover:text-emerald-600 group-hover:border-emerald-200'
                    }`}>
                      {sample.isMultiFile ? (
                        <Calendar className="w-5 h-5" />
                      ) : sample.fileType?.includes('pdf') ? (
                        <FileText className="w-5 h-5" />
                      ) : (
                        <ImageIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-950">
                          {sample.name}
                        </p>
                        {sample.isMultiFile && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                            3 Years
                          </span>
                        )}
                      </div>
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
            <span>Multi-Statement Upload</span>
          </div>
          <p className="text-xs text-slate-600">
            Upload multiple PDF statements at once. Automatically parses each statement and combines them into one unified database.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs">
            <CheckCircle className="w-4 h-4" />
            <span>Single CSV Separated by Year</span>
          </div>
          <p className="text-xs text-slate-600">
            Output is organized into a single CSV file with distinct year sections, deposit/withdrawal totals, and date ordering.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs">
            <CheckCircle className="w-4 h-4" />
            <span>1-Click Google Sheets Ready</span>
          </div>
          <p className="text-xs text-slate-600">
            Copy year-separated TSV grid directly to clipboard for direct copy-paste into Google Sheets or Microsoft Excel.
          </p>
        </div>
      </div>

    </div>
  );
};
