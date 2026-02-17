
import React, { useState, useEffect, useCallback } from 'react';
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
  const [isProcessing, setIsProcessing] = useState(false);

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

    try {
      const analysis = await analyzeJobMatch(resume, newJob);
      setResults(prev => ({
        ...prev,
        [jobId]: { ...analysis, jobId, analyzing: false }
      }));
    } catch (err) {
      console.error(err);
      setResults(prev => ({
        ...prev,
        [jobId]: { ...prev[jobId], analyzing: false, error: "Failed to analyze. Check console." }
      }));
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

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Config */}
        <div className="lg:col-span-4 space-y-6">
          <ResumeSection resume={resume} onSetResume={setResume} />
          
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-2">How it works</h3>
            <ul className="space-y-3 text-sm text-blue-100">
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                Upload your resume so the AI knows your background.
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                Find a job on LinkedIn and paste the details here.
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                Get an instant compatibility score and a tailored cover letter.
              </li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
               <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               Pro Tips
            </h4>
            <div className="space-y-4">
               <div>
                 <p className="text-xs font-bold text-gray-500 uppercase mb-1">CORS Limitation</p>
                 <p className="text-xs text-gray-600">Standard web browsers block direct LinkedIn scraping. For best results, paste the job description manually.</p>
               </div>
               <div>
                 <p className="text-xs font-bold text-gray-500 uppercase mb-1">Gemini Analysis</p>
                 <p className="text-xs text-gray-600">Flash-preview provides lighting-fast matches. Use specific keywords in your resume for higher scores.</p>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Main Area */}
        <div className="lg:col-span-8 space-y-8">
          <JobScanner onAddJob={addJob} />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-bold text-gray-900">Analysis Dashboard</h2>
               <span className="text-xs font-medium text-gray-400">{jobs.length} Matches Found</span>
            </div>

            {jobs.length === 0 ? (
              <div className="bg-white border border-gray-200 border-dashed rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                </div>
                <h3 className="text-gray-900 font-semibold mb-1">No jobs analyzed yet</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">Upload a resume and add a job above to see your AI matching score and custom cover letter.</p>
              </div>
            ) : (
              jobs.map(job => {
                const result = results[job.id];
                if (!result || result.analyzing) {
                  return (
                    <div key={job.id} className="bg-white rounded-xl p-8 border border-gray-200 flex flex-col items-center justify-center animate-pulse">
                      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-sm font-medium text-gray-600">AI is matching your resume with {job.title}...</p>
                      <p className="text-xs text-gray-400 mt-1">Calculating score & writing cover letter</p>
                    </div>
                  );
                }
                
                if (result.error) {
                  return (
                    <div key={job.id} className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex justify-between items-center">
                      <span>Error analyzing {job.title}: {result.error}</span>
                      <button onClick={() => removeJob(job.id)} className="font-bold">Dismiss</button>
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
              })
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default App;
