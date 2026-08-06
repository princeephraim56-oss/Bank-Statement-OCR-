import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, Terminal, Globe, Github, Copy, Check, ExternalLink } from 'lucide-react';
import { copyToClipboard } from '../utils/csv';

interface DeploymentTroubleshootingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentTroubleshootingModal: React.FC<DeploymentTroubleshootingModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (text: string, key: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedCmd(key);
      setTimeout(() => setCopiedCmd(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Fixing "404: DEPLOYMENT_NOT_FOUND" & GitHub Setup
              </h2>
              <p className="text-xs text-slate-400">Step-by-step resolution for GitHub export & live hosting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs text-slate-700 leading-relaxed">
          
          {/* Issue Explanation */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1.5">
            <div className="flex items-center space-x-2 font-bold text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Why Did "404: DEPLOYMENT_NOT_FOUND" Occur?</span>
            </div>
            <p>
              The error code <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-950">DEPLOYMENT_NOT_FOUND</code> happens when attempting to visit an expired preview link, an inactive sandbox branch URL, or when a repository was exported to GitHub without serverless routing configuration.
            </p>
          </div>

          {/* Solution 1: Live Web App Access */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>1. Direct Live App Preview in AI Studio</span>
            </h3>
            <p className="text-slate-600">
              You can access this application directly inside Google AI Studio without encountering deployment 404s. Use the live preview tab in your workspace or click the <strong>Share</strong> button to generate an active public URL.
            </p>
          </div>

          {/* Solution 2: 1-Click Run Locally from GitHub */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-700" />
              <span>2. Running Locally from GitHub (Recommended)</span>
            </h3>
            <p className="text-slate-600">
              If you exported this repository to GitHub, you can run the full app locally on your machine with 3 simple commands:
            </p>
            <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] space-y-2 relative">
              <button
                onClick={() => handleCopy('git clone <YOUR-GITHUB-REPO-URL>\ncd <REPO-DIR>\nnpm install\nnpm run dev', 'local')}
                className="absolute right-3 top-3 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center gap-1 transition-colors"
              >
                {copiedCmd === 'local' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd === 'local' ? 'Copied' : 'Copy'}</span>
              </button>
              <p className="text-slate-400"># 1. Install dependencies</p>
              <p className="text-emerald-400">npm install</p>
              <p className="text-slate-400"># 2. Start local server with Gemini OCR & UI</p>
              <p className="text-emerald-400">npm run dev</p>
              <p className="text-slate-400"># App opens automatically at http://localhost:3000</p>
            </div>
          </div>

          {/* Solution 3: Deploying on Vercel / Netlify / Render */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>3. Deploying to Vercel / Cloud Hosts</span>
            </h3>
            <p className="text-slate-600">
              We have now added <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">vercel.json</code> and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">api/extract.ts</code> to the repository:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Connect your GitHub repository to <strong>Vercel</strong> or <strong>Render</strong>.</li>
              <li>Add your environment variable: <code className="font-mono text-slate-900 font-bold">GEMINI_API_KEY</code> in Project Settings &gt; Environment Variables.</li>
              <li>Deploy — Vercel will now automatically build and serve the app at a live, persistent URL!</li>
            </ul>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors"
          >
            Got It, Thanks!
          </button>
        </div>

      </div>
    </div>
  );
};
