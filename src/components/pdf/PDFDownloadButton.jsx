import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download, Loader2 } from 'lucide-react';

export default function PDFDownloadButton({ 
  document, 
  fileName = 'document.pdf', 
  buttonText = 'Download Official PDF', 
  className = '',
  variant = 'indigo' // 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate' | 'light' | 'custom'
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const variantStyles = {
    indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 border-indigo-500/50',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 border-emerald-500/50',
    rose: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30 border-rose-500/50',
    amber: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30 border-amber-500/50',
    slate: 'bg-slate-800 hover:bg-slate-900 text-white border-slate-700',
    light: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200',
    custom: ''
  };

  const styleClass = variantStyles[variant] !== undefined ? variantStyles[variant] : variantStyles.indigo;

  if (!isClient) {
    return (
      <button 
        className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 opacity-75 cursor-not-allowed ${styleClass} ${className}`} 
        disabled
      >
        <Loader2 className="w-4 h-4 animate-spin text-current" />
        <span>Preparing PDF...</span>
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={document}
      fileName={fileName}
      style={{ textDecoration: 'none' }}
    >
      {({ blob, url, loading, error }) => (
        <button
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer border ${styleClass} ${className}`}
          disabled={loading}
          title={loading ? "Generating real vector PDF..." : "Download Official PDF Document"}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-current" />
              <span>Generating Real PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-current" />
              <span>{buttonText}</span>
            </>
          )}
        </button>
      )}
    </PDFDownloadLink>
  );
}
