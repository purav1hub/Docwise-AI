import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { TextInput } from './components/TextInput';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { analyzeOrCompare } from './services/geminiService';
import { AppStatus, AnalysisResult, ComparisonResult, FileData, TextData, UserType } from './types';
import { Shield, BookOpen, AlertCircle, Languages, User, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<{ analysis?: AnalysisResult, comparison?: ComparisonResult } | null>(null);
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [userType, setUserType] = useState<UserType>('Individual');
  const [language, setLanguage] = useState<string>('Simple English');

  const handleFilesSelect = async (files: FileData[]) => {
    if (files.length === 0) return;
    
    setStatus('analyzing');
    setErrorMsg(null);
    try {
      const inputs = files.map(f => ({
        type: 'file' as const,
        data: f.base64,
        mimeType: f.mimeType,
        fileName: f.file.name
      }));
      
      const res = await analyzeOrCompare(inputs, userType, language);
      setResult(res);
      setStatus('complete');
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong during analysis.");
      setStatus('error');
    }
  };

  const handleTextScan = async (data: TextData) => {
    setStatus('analyzing');
    setErrorMsg(null);
    try {
      const res = await analyzeOrCompare([{ type: data.type, data: data.content }], userType, language);
      setResult(res);
      setStatus('complete');
    } catch (err: any) {
      setErrorMsg(err.message || "Analysis failed.");
      setStatus('error');
    }
  };

  const handleReset = () => {
    setResult(null);
    setStatus('idle');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-brand-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4">
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-brand-600 cursor-pointer" onClick={handleReset}>
            <BookOpen className="w-8 h-8" />
            <h1 className="text-2xl font-black tracking-tighter text-slate-900">DocWise<span className="text-brand-500">.</span></h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
              <User size={14} className="text-slate-400" />
              <select 
                value={userType} 
                onChange={(e) => setUserType(e.target.value as UserType)}
                className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none appearance-none pr-1"
                disabled={status === 'analyzing'}
              >
                <option value="Individual">Individual</option>
                <option value="Small Business">Business</option>
                <option value="Student">Student</option>
                <option value="Freelancer">Freelancer</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 rounded-full border border-brand-100">
              <Languages size={14} className="text-brand-500" />
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-xs font-bold text-brand-700 focus:outline-none appearance-none pr-1"
                disabled={status === 'analyzing'}
              >
                <option value="Simple English">English</option>
                <option value="Spanish">Español</option>
                <option value="French">Français</option>
                <option value="German">Deutsch</option>
                <option value="Chinese">中文</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-12">
        {status === 'complete' && result ? (
          <AnalysisDashboard data={result.comparison || result.analysis!} onReset={handleReset} />
        ) : (
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-12 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-50 to-indigo-50 text-brand-700 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-brand-100">
                <Sparkles size={14} className="text-brand-500 animate-pulse" /> Protected by DocWise AI
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-tight">
                Read the <span className="text-brand-500 underline decoration-brand-200 underline-offset-8">Fine Print</span>.
              </h2>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
                Decode legal jargon into simple summaries. Scan T&Cs, compare loan offers, and detect hidden risks instantly.
              </p>
              
              <div className="flex justify-center gap-2 mt-12 p-1.5 bg-slate-200/30 rounded-2xl w-fit mx-auto backdrop-blur-md border border-slate-200 shadow-inner">
                <button 
                  onClick={() => setInputMode('file')} 
                  disabled={status === 'analyzing'}
                  className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${inputMode === 'file' ? 'bg-white shadow-xl text-brand-600 ring-1 ring-slate-100' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Upload Files
                </button>
                <button 
                  onClick={() => setInputMode('text')} 
                  disabled={status === 'analyzing'}
                  className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${inputMode === 'text' ? 'bg-white shadow-xl text-brand-600 ring-1 ring-slate-100' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Link or Text
                </button>
              </div>
            </div>

            <div className="relative">
              {inputMode === 'file' ? (
                <FileUpload onFilesSelect={handleFilesSelect} isLoading={status === 'analyzing'} />
              ) : (
                <TextInput onScan={handleTextScan} isLoading={status === 'analyzing'} />
              )}
              
              {status === 'analyzing' && (
                <div className="mt-12 p-10 bg-white border border-slate-200 rounded-[2rem] shadow-2xl inline-block max-w-sm w-full animate-in zoom-in-95 duration-500">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 bg-brand-100 rounded-2xl animate-ping opacity-25"></div>
                    <div className="relative bg-brand-50 rounded-2xl w-full h-full flex items-center justify-center text-brand-600">
                      <BookOpen size={40} className="animate-pulse" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 mb-2">Analyzing...</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Checking for scam patterns, calculating fees, and translating clauses for {userType} perspective.
                  </p>
                </div>
              )}
            </div>

            {status === 'error' && (
              <div className="mt-12 p-8 bg-red-50 border border-red-100 rounded-[2rem] text-red-700 flex flex-col items-center gap-4 max-w-md mx-auto animate-in bounce-in">
                <AlertCircle size={48} strokeWidth={1.5} />
                <div className="font-bold text-lg text-center">{errorMsg}</div>
                <button 
                  onClick={() => setStatus('idle')} 
                  className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-16 px-4 print:hidden">
        <div className="max-w-6xl mx-auto text-center space-y-6">
           <div className="flex items-center justify-center gap-2 text-slate-900 font-black text-xl">
             <BookOpen className="text-brand-500" /> DocWise AI
           </div>
           <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
             DocWise AI is an educational tool designed to help you understand legal text. We are not lawyers and this analysis is not legal advice. Always read your final contracts.
           </p>
           <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-300 uppercase tracking-widest">
              <span>&copy; 2025 DocWise Intelligence</span>
              <div className="flex gap-8">
                <span className="cursor-pointer hover:text-slate-500 transition-colors">Privacy</span>
                <span className="cursor-pointer hover:text-slate-500 transition-colors">Safety</span>
                <span className="cursor-pointer hover:text-slate-500 transition-colors">Support</span>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;