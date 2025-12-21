import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

interface RiskGaugeProps {
  score: number;
  level: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, level }) => {
  // Determine color based on score
  const getColor = (val: number) => {
    if (val < 30) return 'text-green-500 bg-green-50 border-green-200';
    if (val < 70) return 'text-yellow-500 bg-yellow-50 border-yellow-200';
    return 'text-red-500 bg-red-50 border-red-200';
  };

  const getIcon = (val: number) => {
    if (val < 30) return <ShieldCheck size={32} />;
    if (val < 70) return <AlertTriangle size={32} />;
    return <ShieldAlert size={32} />;
  };

  const colorClass = getColor(score);
  
  // Calculate stroke dashoffset for the SVG circle
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`flex items-center p-6 rounded-xl border ${colorClass} transition-all`}>
      <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
         {/* Background Circle */}
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-white opacity-30"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {getIcon(score)}
        </div>
      </div>
      
      <div className="ml-6">
        <h4 className="text-sm font-semibold uppercase tracking-wider opacity-80">Risk Assessment</h4>
        <div className="text-3xl font-bold">{level}</div>
        <p className="text-sm opacity-90 mt-1">
          DocWise rates this document as <strong>{score}/100</strong> on the risk scale.
        </p>
      </div>
    </div>
  );
};