import React, { useState } from 'react';
import { Globe, FileText, ArrowRight, Link } from 'lucide-react';

interface TextInputProps {
  onScan: (data: { content: string, type: 'text' | 'url' }) => void;
  isLoading: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ onScan, isLoading }) => {
  const [mode, setMode] = useState<'url' | 'text'>('text');
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onScan({ content: value, type: mode });
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all">
      <div className="flex border-b border-slate-100">
        <button 
          onClick={() => setMode('text')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${mode === 'text' ? 'bg-brand-50 text-brand-600 border-b-2 border-brand-500' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <FileText size={16} /> Paste T&C Text
        </button>
        <button 
          onClick={() => setMode('url')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${mode === 'url' ? 'bg-brand-50 text-brand-600 border-b-2 border-brand-500' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Globe size={16} /> Scan Website/URL
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {mode === 'text' ? (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paste the Terms and Conditions text here..."
            className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none text-sm text-slate-700"
            disabled={isLoading}
          />
        ) : (
          <div className="relative">
            <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. https://example.com/terms"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm text-slate-700"
              disabled={isLoading}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
            isLoading || !value.trim() 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
            : 'bg-brand-600 text-white hover:bg-brand-700 shadow-md hover:shadow-lg'
          }`}
        >
          {isLoading ? 'Scanning...' : (mode === 'text' ? 'Analyze Text' : 'Fetch & Scan URL')}
          {!isLoading && <ArrowRight size={18} />}
        </button>
      </form>
    </div>
  );
};