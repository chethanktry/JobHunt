
import React, { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { ResumeSection } from './components/ResumeSection';
import { JobScanner } from './components/JobScanner';
import { ResultCard } from './components/ResultCard';
import { Resume, JobInput, MatchResult } from './types';
import { analyzeJobMatch } from './services/geminiService';

const App: React.FC = () => {
  const [resume, setResume] = useState<Resume | null>(null);
  const [jobs, setJobs] = useState<JobInput[]>([]);
  const [results, setResults] = useState<Record<string, MatchResult>>({});

  const processJob = async (job: JobInput, currentResume: Resume) => {
    try {
      const analysis = await analyzeJobMatch(currentResume, job);
      setResults(prev => ({
        ...prev,
        [job.id]: { ...analysis, jobId: job.id, analyzing: false }
      }));
    } catch (err) {
      console.error(`Failed to analyze ${job.title}:`, err);
      setResults(prev => ({
        ...prev,
        [job.id]: { ...prev[job.id], analyzing: false, error: "AI matching failed. Please try again." }
      }));
    }
  };

  const addJob = useCallback(async (title: string, company: string, description: string, url?: string) => {
    if (!resume) {
      alert("Please upload your resume first!");
      return;
    }

    const jobId = Math.random().toString(36).substring(7);
    const newJob: JobInput = { id: jobId, title, company, description, url };
    
    setJobs(prev => [newJob, ...prev]);
    setResults(prev => ({
      ...prev,
      [jobId]: { jobId, score: 0, reasoning: '', coverLetter: '', matchingSkills: [], missingSkills: [], analyzing: true }
    }));

    await processJob(newJob, resume);
  }, [resume]);

  const batchAddJobs = useCallback(async (newJobs: Array<{title: string, company: string, description: string, url?: string}>) => {
    if (!resume) {
      alert("Please upload your resume first!");
      return;
    }

    const jobInputs: JobInput[] = newJobs.map(j => ({
      ...j,
      id: Math.random().toString(36).substring(7)
    }));

    setJobs(prev => [...jobInputs, ...prev]);
    
    // Set all to analyzing state
    const initialResults: Record<string, MatchResult> = {};
    jobInputs.forEach(j => {
      initialResults[j.id] = { jobId: j.id, score: 0, reasoning: '', coverLetter: '', matchingSkills: [], missingSkills: [], analyzing: true };
    });
    setResults(prev => ({ ...prev, ...initialResults }));

    // Process sequentially to avoid rate limits (mimics the 'Wait 10 sec' node)
    for (const job of jobInputs) {
      await processJob(job, resume);
      // Small artificial delay to mimic the n8n workflow's throttle
      await new Promise(r => setTimeout(r, 1000));
    }
  }, [resume]);

  const removeJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    setResults(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const exportResults = () => {
    const data = jobs.map(job => {
      const res = results[job.id];
      return {
        Title: job.title,
        Company: job.company,
        Score: res?.score || 0,
        Reasoning: res?.reasoning || '',
        CoverLetter: res?.coverLetter || '',
        Link: job.url || ''
      };
    });
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Title,Company,Score,Reasoning,CoverLetter,Link"].join(",") + "\n"
      + data.map(row => Object.values(row).map(v => `"${v}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "job_match_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Automation Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <ResumeSection resume={resume} onSetResume={setResume} />
          
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
             <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Workflow Engine</h3>
             </div>
             <div className="p-4 space-y-4">
                <div className="flex gap-3">
                   <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-blue-600 text-xs font-bold">1</div>
                   <div>
                     <p className="text-xs font-bold text-gray-900">Extract from File</p>
                     <p className="text-[10px] text-gray-500 italic">Resume content parsed for AI matching.</p>
                   </div>
                </div>
                <div className="flex gap-3">
                   <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded flex items-center justify-center text-indigo-600 text-xs font-bold">2</div>
                   <div>
                     <p className="text-xs font-bold text-gray-900">Search URL Generator</p>
                     <p className="text-[10px] text-gray-500 italic">Custom LinkedIn filters applied.</p>
                   </div>
                </div>
                <div className="flex gap-3">
                   <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded flex items-center justify-center text-purple-600 text-xs font-bold">3</div>
                   <div>
                     <p className="text-xs font-bold text-gray-900">AI Matcher Agent</p>
                     <p className="text-[10px] text-gray-500 italic">Gemini calculates score & cover letter.</p>
                   </div>
                </div>
                <div className="flex gap-3">
                   <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded flex items-center justify-center text-green-600 text-xs font-bold">4</div>
                   <div>
                     <p className="text-xs font-bold text-gray-900">Append Row in Sheet</p>
                     <p className="text-[10px] text-gray-500 italic">Simulation: Export results to CSV/Sheet.</p>
                   </div>
                </div>
             </div>
          </div>

          <button 
            onClick={exportResults}
            disabled={jobs.length === 0}
            className="w-full bg-white border-2 border-green-500 text-green-600 py-3 rounded-xl font-bold hover:bg-green-50 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export results to Sheet (CSV)
          </button>
        </div>

        {/* Right Column: Main Dashboard */}
        <div className="lg:col-span-8 space-y-6">
          <JobScanner onAddJob={addJob} onBatchAdd={batchAddJobs} />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <h2 className="text-lg font-bold text-gray-800">Job Matching Queue</h2>
               <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-tighter">
                    {/* Explicitly cast Object.values(results) to MatchResult[] to resolve 'unknown' type error */}
                    {(Object.values(results) as MatchResult[]).filter(r => r.analyzing).length} processing
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    {jobs.length} total
                  </span>
               </div>
            </div>

            {jobs.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-16 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Automated Matcher Ready</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                  Upload your resume in the sidebar, then use the manual input or batch import to start matching with LinkedIn opportunities.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {jobs.map(job => {
                  const result = results[job.id];
                  if (!result || result.analyzing) {
                    return (
                      <div key={job.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                           </div>
                           <div>
                              <p className="text-sm font-bold text-gray-900">{job.title}</p>
                              <p className="text-xs text-gray-400">AI is matching with resume...</p>
                           </div>
                        </div>
                        <span className="text-[10px] text-gray-300 font-mono italic">Wait 10s...</span>
                      </div>
                    );
                  }
                  
                  return (
                    <ResultCard 
                      key={job.id} 
                      job={job} 
                      result={result} 
                      onRemove={() => removeJob(job.id)} 
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default App;
