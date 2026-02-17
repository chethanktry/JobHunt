
import React, { useState } from 'react';
import { SearchFilters } from '../types';
import { EXPERIENCE_LEVELS, JOB_TYPES, REMOTE_OPTIONS } from '../constants';

interface Props {
  onAddJob: (title: string, company: string, description: string, url?: string) => void;
}

export const JobScanner: React.FC<Props> = ({ onAddJob }) => {
  const [activeTab, setActiveTab] = useState<'url' | 'manual'>('manual');
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    location: '',
    experienceLevel: [],
    remote: [],
    jobType: [],
    easyApply: false
  });

  const [manualJob, setManualJob] = useState({
    title: '',
    company: '',
    description: '',
    url: ''
  });

  const generateLinkedInUrl = () => {
    let url = "https://www.linkedin.com/jobs/search/?f_TPR=r86400";
    if (filters.keyword) url += `&keywords=${encodeURIComponent(filters.keyword)}`;
    if (filters.location) url += `&location=${encodeURIComponent(filters.location)}`;
    if (filters.experienceLevel.length) url += `&f_E=${filters.experienceLevel.join(',')}`;
    if (filters.remote.length) url += `&f_WT=${filters.remote.join(',')}`;
    if (filters.jobType.length) {
      url += `&f_JT=${filters.jobType.join(',')}`;
    }
    if (filters.easyApply) url += "&f_EA=true";
    return url;
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualJob.title || !manualJob.description) return;
    onAddJob(manualJob.title, manualJob.company, manualJob.description, manualJob.url);
    setManualJob({ title: '', company: '', description: '', url: '' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab === 'manual' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Add Job Manually
        </button>
        <button 
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab === 'url' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}`}
        >
          LinkedIn Search Generator
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'manual' ? (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Job Title</label>
                <input 
                  type="text" 
                  value={manualJob.title}
                  onChange={e => setManualJob({...manualJob, title: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company</label>
                <input 
                  type="text" 
                  value={manualJob.company}
                  onChange={e => setManualJob({...manualJob, company: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Google"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Job Description</label>
              <textarea 
                rows={5}
                value={manualJob.description}
                onChange={e => setManualJob({...manualJob, description: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Paste the full job description here..."
              ></textarea>
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Analyze this Job
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Keywords</label>
                <input 
                  type="text" 
                  value={filters.keyword}
                  onChange={e => setFilters({...filters, keyword: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
                  placeholder="React, TypeScript..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
                <input 
                  type="text" 
                  value={filters.location}
                  onChange={e => setFilters({...filters, location: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
                  placeholder="New York, Remote..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">Exp. Level</label>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_LEVELS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        const next = filters.experienceLevel.includes(opt.value) 
                          ? filters.experienceLevel.filter(v => v !== opt.value)
                          : [...filters.experienceLevel, opt.value];
                        setFilters({...filters, experienceLevel: next});
                      }}
                      className={`text-[10px] px-2 py-1 rounded border ${filters.experienceLevel.includes(opt.value) ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-white border-gray-200 text-gray-600'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">Work Style</label>
                <div className="flex flex-wrap gap-2">
                  {REMOTE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        const next = filters.remote.includes(opt.value) 
                          ? filters.remote.filter(v => v !== opt.value)
                          : [...filters.remote, opt.value];
                        setFilters({...filters, remote: next});
                      }}
                      className={`text-[10px] px-2 py-1 rounded border ${filters.remote.includes(opt.value) ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-white border-gray-200 text-gray-600'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                 <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Easy Apply</label>
                    <input 
                      type="checkbox" 
                      checked={filters.easyApply}
                      onChange={e => setFilters({...filters, easyApply: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                 </div>
                 <div className="p-3 bg-blue-50 border border-blue-100 rounded text-[10px] text-blue-700 leading-tight">
                    This generator builds a LinkedIn URL with these filters to help you find jobs to paste here.
                 </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
               <div className="flex items-center justify-between mb-2">
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Generated URL</span>
                 <a 
                   href={generateLinkedInUrl()} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-xs text-blue-600 hover:underline font-semibold"
                 >
                   Open on LinkedIn →
                 </a>
               </div>
               <div className="bg-gray-100 p-2 rounded text-[10px] font-mono break-all text-gray-500 border border-gray-200">
                 {generateLinkedInUrl()}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
