
import { GoogleGenAI, Type } from "@google/genai";
import { JobInput, Resume } from "../types";

export const analyzeJobMatch = async (resume: Resume, job: JobInput) => {
  // Use the API key directly from process.env as required by SDK guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      job_description: ${job.description}
      my_resume: ${resume.text}
    `,
    config: {
      systemInstruction: `Hi, you are a helpful job matcher. You read my resume then analyze the given resume and job description and provide a job matching score (0-100).
      
      Also write a cover letter based on my resume and the job description. 
      CRITICAL REQUIREMENTS for Cover Letter:
      - It must be at least 2 paragraphs.
      - Ignore the name, address, and signature part from the start and end. 
      - Do not include [Your Name], [Your Address], or generic placeholders for the sender/receiver info at the top or bottom.
      - Start directly with the salutation (e.g., "Dear Hiring Manager").
      
      Additional Analysis:
      - Identify matching skills.
      - Identify missing skills.
      - Provide a brief reasoning for the score.

      Return the response strictly in JSON format.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER, description: "Matching score from 0 to 100" },
          reasoning: { type: Type.STRING, description: "A brief professional explanation for the score" },
          coverLetter: { type: Type.STRING, description: "The tailored cover letter (min 2 paragraphs, no headers/footers)" },
          matchingSkills: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of skills from resume that match the job"
          },
          missingSkills: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of key skills mentioned in job but missing in resume"
          }
        },
        required: ["score", "reasoning", "coverLetter", "matchingSkills", "missingSkills"]
      }
    }
  });

  // Extract text directly from the response object
  return JSON.parse(response.text || '{}');
};

export const extractTextFromPdfPlaceholder = async (file: File): Promise<string> => {
  // Simple simulation of text extraction for demo purposes
  // In production, one would use a library like pdf.js
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string || "";
      // Clean up some whitespace to simulate a "read" resume
      resolve(content.replace(/\s+/g, ' ').trim());
    };
    reader.readAsText(file);
  });
};
