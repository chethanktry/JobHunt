
import React, { useState } from 'react';
import { MatchResult, JobInput } from '../types';

interface Props {
  job: JobInput;
  result: MatchResult;
  onRemove: () => void;
}

export const ResultCard: React.FC<Props> = ({ job, result, onRemove }) => {
  const [showCoverLetter, setShowCoverLetter] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-8">
        {/* Score Circle */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-100" />
              <circle 
                cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="10" fill="transparent" 
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={(2 * Math.PI * 40) - (result.score / 100) * (2 * Math.PI * 40)}
                className={result.score >= 80 ? 'text-green-500' : result.score >= 50 ? 'text-yellow-500' : 'text-red-500'}
                style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-gray-800">{result.score}%</span>
            </div>
          </div>
          <span className="text-[9px] font-black text-gray-400 uppercase mt-2 tracking-widest">Match Rating</span>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-black text-gray-900 leading-tight">{job.title}</h3>
              <p className="text-blue-600 font-black text-sm uppercase tracking-tight">{job.company}</p>
            </div>
            <button onClick={onRemove} className="text-gray-300 hover:text-red-500 p-1 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500 shadow-inner">
            <p className="text-xs text-gray-700 leading-relaxed italic font-medium">
              "{result.reasoning}"
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span> Matching Assets
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.matchingSkills.map((skill, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded font-bold uppercase tracking-tighter">{skill}</span>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
                 <span className="w-2 h-2 bg-red-500 rounded-full"></span> Growth Areas
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.missingSkills.map((skill, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded font-bold uppercase tracking-tighter">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 bg-gray-50 flex justify-between items-center border-t border-gray-100">
        <div className="flex items-center gap-4">
           {job.url && (
             <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-black hover:underline flex items-center gap-1 uppercase tracking-tight">
               Original Post <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
             </a>
           )}
        </div>
        <button 
          onClick={() => setShowCoverLetter(!showCoverLetter)}
          className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm border ${showCoverLetter ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
        >
          {showCoverLetter ? 'Close Letter' : 'Review Cover Letter'}
          <svg className={`w-3 h-3 transition-transform ${showCoverLetter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>

      {showCoverLetter && (
        <div className="p-8 bg-white border-t border-gray-100 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Tailored Application Statement</h4>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(result.coverLetter);
                alert("Copied to clipboard!");
              }}
              className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-black uppercase tracking-wider hover:bg-gray-200 transition-colors"
            >
              Copy Text
            </button>
          </div>
          <div className="max-w-2xl mx-auto font-serif text-gray-800 leading-relaxed bg-white border border-gray-100 p-10 shadow-inner rounded-sm whitespace-pre-wrap italic">
            {result.coverLetter}
          </div>
          <p className="text-center mt-6 text-[10px] text-gray-400 font-black uppercase tracking-widest italic opacity-50">
            Generated via Automated Matcher Agent v1.1
          </p>
        </div>
      )}
    </div>
  );
};
