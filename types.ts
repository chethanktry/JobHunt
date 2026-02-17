
export interface Resume {
  text: string;
  fileName: string;
}

export interface JobInput {
  id: string;
  title: string;
  company: string;
  description: string;
  url?: string;
}

export interface MatchResult {
  jobId: string;
  score: number;
  reasoning: string;
  coverLetter: string;
  matchingSkills: string[];
  missingSkills: string[];
  analyzing: boolean;
  error?: string;
}

export interface SearchFilters {
  keyword: string;
  location: string;
  experienceLevel: string[];
  remote: string[];
  jobType: string[];
  easyApply: boolean;
}
