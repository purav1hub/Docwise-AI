
import React, { useState } from 'react';
import { AnalysisResult, ComparisonResult } from '../types';
import { RiskGauge } from './RiskGauge';
import { FileText, HelpCircle, CheckCircle2, ChevronDown, ChevronUp, DollarSign, AlertTriangle, Calendar, Download, Languages, ShieldAlert, Award } from 'lucide-react';

interface AnalysisDashboardProps {
  data: AnalysisResult | ComparisonResult;
  onReset: () => void;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ data, onReset }) => {
  const [activeTab, setActiveTab] = useState<'one-page' | 'details' | 'comparison' | 'risks'>('one-page');
  const isComparison = 'comparisonTable' in data;
  
  // Safe access to primary analysis data
  const analysisData = isComparison 
    ? (data as ComparisonResult).docs?.[0] 
    : (data as AnalysisResult);

  if (!analysisData) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500 mb-4">No analysis data available. The document might have been too complex to process.</p>
        <button onClick={onReset} className="px-6 py-2 bg-brand-600 text-white rounded-lg">Try Another Document</button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const getVerdictStyles = (v?: string) => {
    switch(v) {
      case 'High risk': return 'bg-red-600 text-white';
      case 'Needs attention': return 'bg-yellow-500 text-white';
      default: return 'bg-green-600 text-white';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-12 print:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">DocWise Report</h2>
          <p className="text-slate-500">{isComparison ? `${(data as ComparisonResult).docs?.length || 0} Documents Compared` : (analysisData.fileName || 'Analysis Result')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <Download size={16} /> PDF Export
          </button>
          <button onClick={onReset} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
            New Scan
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto print:hidden">
        <button onClick={() => setActiveTab('one-page')} className={`pb-4 px-6 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'one-page' ? 'border-b-2 border-brand-500 text-brand-600' : 'text-slate-500'}`}>One-Page Summary</button>
        {isComparison && <button onClick={() => setActiveTab('comparison')} className={`pb-4 px-6 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'comparison' ? 'border-b-2 border-brand-500 text-brand-600' : 'text-slate-500'}`}>Comparison Matrix</button>}
        <button onClick={() => setActiveTab('details')} className={`pb-4 px-6 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'details' ? 'border-b-2 border-brand-500 text-brand-600' : 'text-slate-500'}`}>Full Analysis</button>
        <button onClick={() => setActiveTab('risks')} className={`pb-4 px-6 text-sm font-bold transition-colors whitespace-nowrap text-red-600 ${activeTab === 'risks' ? 'border-b-2 border-red-500' : ''}`}>Red Flags & Unfair Terms</button>
      </div>

      <div className="space-y-8">
        {/* ONE PAGE SUMMARY VIEW */}
        {(activeTab === 'one-page') && (
          <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm print:border-0 print:shadow-none">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FileText className="text-brand-500" /> One-Page Simplified Summary</h3>
                <p className="text-slate-700 leading-relaxed text-lg mb-6">{analysisData.onePageSummary || analysisData.simpleExplanation || "Summary not provided."}</p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                      <span className="text-xs font-bold text-red-600 uppercase">Risk Level</span>
                      <div className="text-xl font-bold text-red-700">{analysisData.riskLevel || 'Safe'}</div>
                   </div>
                   <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                      <span className="text-xs font-bold text-indigo-600 uppercase">Verdict</span>
                      <div className="text-xl font-bold text-indigo-700">{analysisData.verdict || 'Mostly normal'}</div>
                   </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl flex flex-col justify-center items-center text-center shadow-md ${getVerdictStyles(analysisData.verdict)}`}>
                <span className="text-xs uppercase font-bold opacity-80 mb-1">DocWise Conclusion</span>
                <div className="text-xl font-black mb-2 leading-tight">{analysisData.verdict || "Standard Agreement"}</div>
                <p className="text-xs opacity-90 leading-tight">{analysisData.verdictReason || "Based on typical industry standards."}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Calendar size={18} className="text-brand-500" /> Critical Dates</h4>
                <div className="space-y-3">
                  {(analysisData.importantDates ?? []).map((d, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${d.deadline ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="text-xs font-bold text-slate-400">{d.date || 'TBD'}</div>
                      <div className={`text-sm font-medium ${d.deadline ? 'text-orange-700' : 'text-slate-700'}`}>{d.event || 'Unknown event'}</div>
                    </div>
                  ))}
                  {(analysisData.importantDates ?? []).length === 0 && <p className="text-slate-400 text-xs text-center italic">No dates detected.</p>}
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl">
                 <h4 className="font-bold mb-4 flex items-center gap-2 text-red-400"><ShieldAlert size={18} /> Scam Detection</h4>
                 <div className="flex items-end gap-3 mb-4">
                    <div className="text-4xl font-black">{analysisData.scamRiskScore ?? 0}%</div>
                    <div className="text-xs font-bold opacity-60 mb-1">Risk Score</div>
                 </div>
                 <p className="text-xs opacity-80 leading-relaxed">{analysisData.scamAnalysis || "No obvious scam patterns detected by AI markers."}</p>
              </div>
            </div>
          </div>
        )}

        {/* COMPARISON VIEW */}
        {isComparison && activeTab === 'comparison' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white p-8 rounded-2xl border border-brand-200 bg-brand-50/20 shadow-sm">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-brand-900"><Award className="text-brand-500" /> Comparison Winner</h3>
              <div className="p-4 bg-white rounded-xl border border-brand-100 mb-4">
                <span className="text-xs font-bold text-brand-500 uppercase tracking-widest">Recommended Choice</span>
                <div className="text-2xl font-black text-slate-800">{(data as ComparisonResult).winner || "Balanced Result"}</div>
              </div>
              <p className="text-slate-600">{(data as ComparisonResult).winnerReason || "Documents appear relatively similar in scope."}</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-widest">Feature</th>
                    {((data as ComparisonResult).docs ?? []).map((d, i) => (
                      <th key={i} className="p-4 text-sm font-bold text-slate-800">{d.fileName || `Doc ${i+1}`}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {((data as ComparisonResult).comparisonTable ?? []).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-4 text-sm font-bold text-slate-600 bg-slate-50/30">{row.feature || "N/A"}</td>
                      {(row.values ?? []).map((val, vi) => (
                        <td key={vi} className="p-4 text-sm text-slate-600">{val || "Not specified"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DETAILS VIEW */}
        {activeTab === 'details' && (
          <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                 <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><DollarSign className="text-green-500" /> Financial Impact Breakdown</h4>
                 <div className="space-y-2">
                    {(analysisData.financialBreakdown ?? []).map((f, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase mr-2">{f.type || 'fee'}</span>
                          <span className="font-medium text-slate-700">{f.label || 'Misc Cost'}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900">{f.value || '$0'}</div>
                          {f.frequency && <div className="text-[10px] text-slate-400">{f.frequency}</div>}
                        </div>
                      </div>
                    ))}
                    {(analysisData.financialBreakdown ?? []).length === 0 && <p className="text-slate-400 text-xs italic">No specific financial terms extracted.</p>}
                 </div>
              </div>
              
              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                 <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-indigo-500" /> Personalized Warnings</h4>
                 <ul className="space-y-3">
                    {(analysisData.personalizedWarnings ?? []).map((w, i) => (
                      <li key={i} className="flex gap-3 text-sm text-indigo-800 font-medium">
                        <span className="text-indigo-300">•</span> {w}
                      </li>
                    ))}
                    {(analysisData.personalizedWarnings ?? []).length === 0 && <li className="text-xs text-indigo-400 italic">No specific warnings for your persona.</li>}
                 </ul>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 flex items-center gap-2"><CheckCircle2 className="text-brand-500" /> Important Clauses</h4>
              {(analysisData.clauses ?? []).map((clause, idx) => (
                <ClauseItem key={idx} clause={clause} />
              ))}
              {(analysisData.clauses ?? []).length === 0 && <p className="text-slate-400 text-xs italic">No key clauses highlighted.</p>}
            </div>
          </div>
        )}

        {/* RISKS VIEW */}
        {activeTab === 'risks' && (
           <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              {(analysisData.redFlags ?? []).map((flag, idx) => (
                <div key={idx} className={`p-6 rounded-2xl shadow-sm border ${flag.oneSided ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                       {flag.oneSided && <AlertTriangle className="text-red-600" size={20} />}
                       <h4 className="font-bold text-slate-800 text-lg">{flag.title || "Red Flag Detected"}</h4>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${flag.severity === 'High' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {(flag.severity || 'Medium').toUpperCase()} RISK
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-3">{flag.description || "Potential risk identified in text."}</p>
                  {flag.oneSided && (
                    <div className="inline-block px-2 py-1 bg-red-600 text-[10px] text-white font-bold rounded uppercase tracking-tighter">
                      One-Sided / Unfair Term
                    </div>
                  )}
                  {flag.location && <p className="text-xs text-slate-400 mt-2 italic">Ref: {flag.location}</p>}
                </div>
              ))}
              {(analysisData.redFlags ?? []).length === 0 && (
                <div className="p-12 text-center bg-white border border-slate-100 rounded-2xl">
                  <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                  <p className="text-slate-600 font-bold">No major red flags detected.</p>
                </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
};

const ClauseItem: React.FC<{ clause: any }> = ({ clause }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${clause.impact === 'Negative' ? 'bg-red-500' : clause.impact === 'Positive' ? 'bg-green-500' : 'bg-slate-400'}`} />
          <span className="font-bold text-slate-700 text-sm">{clause.originalTitle || "Agreement Clause"}</span>
        </div>
        {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>
      {isOpen && (
        <div className="p-5 border-t border-slate-100 bg-slate-50/30">
          <p className="text-slate-600 text-sm leading-relaxed">{clause.simplifiedExplanation || "No simplified explanation provided."}</p>
        </div>
      )}
    </div>
  );
};
