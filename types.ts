export interface RedFlag {
  title: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  location?: string;
  oneSided?: boolean; // Indicates if clause is unfair/one-sided
}

export interface FinancialDetail {
  label: string;
  value: string;
  type: 'fee' | 'penalty' | 'charge' | 'other';
  frequency?: string;
}

export interface ImportantDate {
  date: string;
  event: string;
  deadline: boolean;
}

export interface SimplifiedClause {
  originalTitle: string;
  simplifiedExplanation: string;
  impact: 'Neutral' | 'Negative' | 'Positive';
}

export interface AnalysisResult {
  fileName?: string;
  sourceType: 'file' | 'text' | 'url' | 'comparison';
  summary: string;
  simpleExplanation: string;
  onePageSummary: string; // Hyper-concise version
  riskScore: number;
  riskLevel: 'Safe' | 'Caution' | 'Risky' | 'Critical';
  verdict: 'Mostly normal' | 'Needs attention' | 'High risk';
  verdictReason: string;
  redFlags: RedFlag[];
  financialBreakdown: FinancialDetail[];
  importantDates: ImportantDate[];
  scamRiskScore: number; // 0-100
  scamAnalysis?: string;
  clauses: SimplifiedClause[];
  questionsToAsk: string[];
  personalizedWarnings: string[];
}

export interface ComparisonResult {
  docs: AnalysisResult[];
  comparisonSummary: string;
  winner: string; // The "best" choice among documents
  winnerReason: string;
  comparisonTable: {
    feature: string;
    values: string[]; // values corresponding to each doc
  }[];
}

export type UserType = 'Individual' | 'Small Business' | 'Student' | 'Freelancer';
export type AppStatus = 'idle' | 'analyzing' | 'complete' | 'error';

export interface FileData {
  file: File;
  base64: string;
  mimeType: string;
}

export interface TextData {
  content: string;
  type: 'text' | 'url';
}