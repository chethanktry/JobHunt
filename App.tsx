
import React, { useState, useCallback, useMemo } from 'react';
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
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  const stats = useMemo(() => {
    const resArray = (Object.values(results) as MatchResult[]).filter(r => !r.analyzing);
    if (resArray.length === 0) return { avg: 0, high: 0, count: 0 };
    const scores = resArray.map(r => r.score);
    return {
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      high: Math.max(...scores),
      count: resArray.length
    };
  }, [results]);

  const processJob = async (job: JobInput, currentResume: Resume) => {
    setCurrentStep("AI Agent: Matching...");
    try {
      const analysis = await analyzeJobMatch(currentResume, job);
      setResults(prev => ({
        ...prev,
        [job.id]: { ...analysis, jobId: job.id, analyzing: false }
      }));
      setCurrentStep("Append Row: Success");
    } catch (err) {
      console.error(`Failed to analyze ${job.title}:`, err);
      setResults(prev => ({
        ...prev,
        [job.id]: { ...prev[job.id], analyzing: false, error: "AI matching failed." }
      }));
      setCurrentStep("Append Row: Failed");
    }
  };

  const addJob = useCallback(async (title: string, company: string, description: string, url?: string) => {
    if (!resume) {
      alert("Please upload your resume first!");
      return;
    }

    const jobId = Math.random().toString(36).substring(7);
    const cleanedDesc = description.replace(/\s+/g, " ");
    const newJob: JobInput = { id: jobId, title, company, description: cleanedDesc, url };
    
    setJobs(prev => [newJob, ...prev]);
    setResults(prev => ({
      ...prev,
      [jobId]: { jobId, score: 0, reasoning: '', coverLetter: '', matchingSkills: [], missingSkills: [], analyzing: true }
    }));

    await processJob(newJob, resume);
    setTimeout(() => setCurrentStep(null), 2000);
  }, [resume]);

  const batchAddJobs = useCallback(async (newJobs: Array<{title: string, company: string, description: string, url?: string}>) => {
    if (!resume) {
      alert("Please upload your resume first!");
      return;
    }

    const jobInputs: JobInput[] = newJobs.map(j => ({
      ...j,
      description: j.description.replace(/\s+/g, " "),
      id: Math.random().toString(36).substring(7)
    }));

    setJobs(prev => [...jobInputs, ...prev]);
    
    const initialResults: Record<string, MatchResult> = {};
    jobInputs.forEach(j => {
      initialResults[j.id] = { jobId: j.id, score: 0, reasoning: '', coverLetter: '', matchingSkills: [], missingSkills: [], analyzing: true };
    });
    setResults(prev => ({ ...prev, ...initialResults }));

    for (const job of jobInputs) {
      setCurrentStep(`Processing: ${job.title}`);
      await processJob(job, resume);
      setCurrentStep("Wait Node: 2s cool-down...");
      await new Promise(r => setTimeout(r, 2000));
    }
    setCurrentStep("Batch Complete");
    setTimeout(() => setCurrentStep(null), 3000);
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
        Reasoning: res?.reasoning?.replace(/"/g, '""') || '',
        CoverLetter: res?.coverLetter?.replace(/"/g, '""') || '',
        Link: job.url || ''
      };
    });
    
    const headers = ["Title", "Company", "Score", "Reasoning", "Cover Letter", "Link"];
    const csvContent = [
      headers.join(","),
      ...data.map(row => [
        `"${row.Title}"`,
        `"${row.Company}"`,
        row.Score,
        `"${row.Reasoning}"`,
        `"${row.CoverLetter}"`,
        `"${row.Link}"`
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `job_matches_${new Date().toISOString().slice(0,10)}.csv`);
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
          
          {/* Stats Widget */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
             <h3 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Pipeline Stats</h3>
             <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                   <p className="text-2xl font-black text-gray-900 tracking-tighter">{stats.count}</p>
                   <p className="text-[10px] text-gray-400 uppercase font-bold">Jobs</p>
                </div>
                <div className="text-center border-x border-gray-100">
                   <p className="text-2xl font-black text-blue-600 tracking-tighter">{stats.avg}%</p>
                   <p className="text-[10px] text-gray-400 uppercase font-bold">Avg Score</p>
                </div>
                <div className="text-center">
                   <p className="text-2xl font-black text-green-600 tracking-tighter">{stats.high}%</p>
                   <p className="text-[10px] text-gray-400 uppercase font-bold">High</p>
                </div>
             </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md">
             <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${currentStep ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                   <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Workflow Engine</h3>
                </div>
                {currentStep && <span className="text-[9px] font-black text-blue-600 animate-bounce tracking-tighter">RUNNING</span>}
             </div>
             <div className="p-4 space-y-4">
                {[
                  { id: 1, name: "Extract from File", desc: "Resume text extracted.", color: "blue", active: !!resume },
                  { id: 2, name: "Search URL Generator", desc: "LinkedIn filters defined.", color: "indigo", active: true },
                  { id: 3, name: "AI Agent (Gemini 3)", desc: "Analyzing match & writing letter.", color: "purple", active: !!currentStep && currentStep.includes("AI") },
                  { id: 4, name: "Append Row / Local Store", desc: "Updating results database.", color: "green", active: !!currentStep && currentStep.includes("Success") }
                ].map(step => (
                  <div key={step.id} className={`flex gap-3 transition-opacity duration-300 ${step.active ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`flex-shrink-0 w-6 h-6 bg-${step.color}-100 rounded flex items-center justify-center text-${step.color}-600 text-[10px] font-black`}>
                      {step.id}
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900 leading-tight">{step.name}</p>
                      <p className="text-[10px] text-gray-500 italic leading-tight">{step.desc}</p>
                    </div>
                  </div>
                ))}
             </div>
             {currentStep && (
               <div className="bg-blue-600 px-4 py-2 text-white text-[10px] font-black flex items-center justify-between uppercase tracking-wider">
                 <span className="truncate pr-2">NODE: {currentStep}</span>
                 <span className="flex-shrink-0 animate-pulse">● ● ●</span>
               </div>
             )}
          </div>

          <button 
            onClick={exportResults}
            disabled={jobs.length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
          >
            <svg className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export to Sheet (CSV)
          </button>
        </div>

        {/* Right Column: Main Dashboard */}
        <div className="lg:col-span-8 space-y-6">
          <JobScanner onAddJob={addJob} onBatchAdd={batchAddJobs} />

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
               <h2 className="text-lg font-black text-gray-800 flex items-center gap-2 uppercase tracking-tighter">
                  Match History
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full tracking-normal">
                    {jobs.length} items
                  </span>
               </h2>
               <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-tighter">
                    {(Object.values(results) as MatchResult[]).filter(r => r.analyzing).length} processing
                  </span>
               </div>
            </div>

            {jobs.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-16 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2 uppercase tracking-tight">Automated Matcher Ready</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                  Upload your resume in the sidebar to begin. Paste single job details or batch import HTML from LinkedIn search results.
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
                              <p className="text-sm font-black text-gray-900 leading-tight">{job.title}</p>
                              <p className="text-xs text-gray-400 font-medium">Workflow executing: AI Agent Match...</p>
                           </div>
                        </div>
                        <span className="text-[10px] text-gray-300 font-mono italic">Wait Node Active...</span>
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
