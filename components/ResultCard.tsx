
import React, { useState } from 'react';
import { MatchResult, JobInput } from '../types';

interface Props {
  job: JobInput;
  result: MatchResult;
  onRemove: () => void;
}

export const ResultCard: React.FC<Props> = ({ job, result, onRemove }) => {
  const [showCoverLetter, setShowCoverLetter] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreCircle = (score: number) => {
    const circumference = 2 * Math.PI * 18;
    const offset = circumference - (score / 100) * circumference;
    return { circumference, offset };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-6">
        {/* Score Circle */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
              <circle 
                cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray={getScoreCircle(result.score).circumference}
                strokeDashoffset={getScoreCircle(result.score).offset}
                className={result.score >= 80 ? 'text-green-500' : result.score >= 50 ? 'text-yellow-500' : 'text-red-500'}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-800">{result.score}%</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase mt-2">Match Score</span>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
              <p className="text-gray-600 font-medium">{job.company}</p>
            </div>
            <button onClick={onRemove} className="text-gray-400 hover:text-red-500 p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <p className="text-sm text-gray-700 mt-4 leading-relaxed">
            <span className="font-semibold text-gray-900">Analysis:</span> {result.reasoning}
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Matching Skills</h4>
              <div className="flex flex-wrap gap-2">
                {result.matchingSkills.map((skill, i) => (
                  <span key={i} className="text-[11px] px-2 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full">{skill}</span>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Missing Skills</h4>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map((skill, i) => (
                  <span key={i} className="text-[11px] px-2 py-1 bg-red-50 text-red-700 border border-red-100 rounded-full">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
           {job.url && (
             <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 font-medium hover:underline">
               View Job Post
             </a>
           )}
        </div>
        <button 
          onClick={() => setShowCoverLetter(!showCoverLetter)}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
        >
          {showCoverLetter ? 'Hide Cover Letter' : 'View AI Cover Letter'}
          <svg className={`w-4 h-4 transition-transform ${showCoverLetter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>

      {showCoverLetter && (
        <div className="p-6 bg-white border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">AI Generated Cover Letter</h4>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(result.coverLetter);
                alert("Copied to clipboard!");
              }}
              className="text-xs text-blue-600 font-bold hover:text-blue-700"
            >
              Copy to Clipboard
            </button>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-serif italic">
            {result.coverLetter}
          </div>
        </div>
      )}
    </div>
  );
};
