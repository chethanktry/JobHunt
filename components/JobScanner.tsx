
import React, { useState } from 'react';
import { SearchFilters } from '../types';
import { EXPERIENCE_LEVELS, JOB_TYPES, REMOTE_OPTIONS } from '../constants';

interface Props {
  onAddJob: (title: string, company: string, description: string, url?: string) => void;
  onBatchAdd: (jobs: Array<{title: string, company: string, description: string, url?: string}>) => void;
}

export const JobScanner: React.FC<Props> = ({ onAddJob, onBatchAdd }) => {
  const [activeTab, setActiveTab] = useState<'url' | 'manual' | 'import'>('manual');
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

  const [htmlInput, setHtmlInput] = useState('');

  const generateLinkedInUrl = () => {
    let url = "https://www.linkedin.com/jobs/search/?f_TPR=r86400";
    if (filters.keyword) url += `&keywords=${encodeURIComponent(filters.keyword)}`;
    if (filters.location) url += `&location=${encodeURIComponent(filters.location)}`;
    if (filters.experienceLevel.length) url += `&f_E=${filters.experienceLevel.join(',')}`;
    if (filters.remote.length) url += `&f_WT=${filters.remote.join(',')}`;
    if (filters.jobType.length) url += `&f_JT=${filters.jobType.join(',')}`;
    if (filters.easyApply) url += "&f_EA=true";
    return url;
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualJob.title || !manualJob.description) return;
    onAddJob(manualJob.title, manualJob.company, manualJob.description, manualJob.url);
    setManualJob({ title: '', company: '', description: '', url: '' });
  };

  const handleImportHtml = () => {
    // Simulating the 'Extract Job Links' node from the n8n workflow
    // Users can paste the source of a LinkedIn search page
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlInput, 'text/html');
    const jobCards = doc.querySelectorAll('.base-card, [data-entity-urn*="jobPosting"]');
    
    const extractedJobs: Array<{title: string, company: string, description: string, url?: string}> = [];
    
    jobCards.forEach(card => {
      const title = card.querySelector('.base-search-card__title, .job-search-card__title')?.textContent?.trim() || 'Imported Job';
      const company = card.querySelector('.base-search-card__subtitle, .job-search-card__subtitle')?.textContent?.trim() || 'Unknown Company';
      const link = card.querySelector('a')?.href || '';
      
      // Since we can't get the description from the search card, we'll ask the user to fill it or simulate
      extractedJobs.push({
        title,
        company,
        description: `This job was imported from LinkedIn search. [Description placeholder - paste full details for better matching]`,
        url: link
      });
    });

    if (extractedJobs.length > 0) {
      onBatchAdd(extractedJobs);
      setHtmlInput('');
      setActiveTab('manual');
      alert(`Imported ${extractedJobs.length} jobs! Please provide their full descriptions in the dashboard for accurate matching.`);
    } else {
      alert("No job cards found. Make sure you're pasting HTML from a LinkedIn search result page.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex border-b border-gray-200 bg-gray-50/30">
        <button 
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider ${activeTab === 'manual' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Single Job
        </button>
        <button 
          onClick={() => setActiveTab('import')}
          className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider ${activeTab === 'import' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Batch Import
        </button>
        <button 
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider ${activeTab === 'url' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Search Filter
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'manual' ? (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Job Title</label>
                <input 
                  type="text" 
                  required
                  value={manualJob.title}
                  onChange={e => setManualJob({...manualJob, title: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="e.g. Senior Product Designer"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Company</label>
                <input 
                  type="text" 
                  value={manualJob.company}
                  onChange={e => setManualJob({...manualJob, company: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="e.g. Acme Corp"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Job Description</label>
              <textarea 
                rows={5}
                required
                value={manualJob.description}
                onChange={e => setManualJob({...manualJob, description: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="Paste the requirements and responsibilities here..."
              ></textarea>
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md active:scale-[0.98]"
            >
              Analyze Job Match
            </button>
          </form>
        ) : activeTab === 'import' ? (
          <div className="space-y-4">
             <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">LinkedIn HTML Source</label>
              <textarea 
                rows={6}
                value={htmlInput}
                onChange={e => setHtmlInput(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Right click on LinkedIn Search Page -> Inspect -> Copy outerHTML of the results list..."
              ></textarea>
            </div>
            <button 
              onClick={handleImportHtml}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-[0.98]"
            >
              Extract Jobs from HTML
            </button>
            <p className="text-[10px] text-gray-400 italic text-center">This simulates the 'Extract Job Links' node from the automation workflow.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Keywords</label>
                <input 
                  type="text" 
                  value={filters.keyword}
                  onChange={e => setFilters({...filters, keyword: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
                  placeholder="React, Lead, Manager..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Location</label>
                <input 
                  type="text" 
                  value={filters.location}
                  onChange={e => setFilters({...filters, location: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
                  placeholder="Remote, London..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase">Exp. Level</label>
                <div className="flex flex-wrap gap-1">
                  {EXPERIENCE_LEVELS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        const next = filters.experienceLevel.includes(opt.value) 
                          ? filters.experienceLevel.filter(v => v !== opt.value)
                          : [...filters.experienceLevel, opt.value];
                        setFilters({...filters, experienceLevel: next});
                      }}
                      className={`text-[9px] px-2 py-1 rounded border font-medium transition-colors ${filters.experienceLevel.includes(opt.value) ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase">Remote/Onsite</label>
                <div className="flex flex-wrap gap-1">
                  {REMOTE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        const next = filters.remote.includes(opt.value) 
                          ? filters.remote.filter(v => v !== opt.value)
                          : [...filters.remote, opt.value];
                        setFilters({...filters, remote: next});
                      }}
                      className={`text-[9px] px-2 py-1 rounded border font-medium transition-colors ${filters.remote.includes(opt.value) ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                 <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase">Easy Apply Only</label>
                    <input 
                      type="checkbox" 
                      checked={filters.easyApply}
                      onChange={e => setFilters({...filters, easyApply: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                 </div>
                 <div className="p-2 bg-blue-50 border border-blue-100 rounded text-[9px] text-blue-700 italic">
                    Mimics the 'Create search URL' node logic.
                 </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
               <div className="flex items-center justify-between mb-2">
                 <span className="text-[10px] font-bold text-gray-400 uppercase">Generated LinkedIn Link</span>
                 <a 
                   href={generateLinkedInUrl()} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                 >
                   Open Search <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                 </a>
               </div>
               <div className="bg-gray-100 p-2 rounded text-[9px] font-mono break-all text-gray-500 border border-gray-200">
                 {generateLinkedInUrl()}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
