
import { GoogleGenAI, Type } from "@google/genai";
import { JobInput, Resume } from "../types";

export const analyzeJobMatch = async (resume: Resume, job: JobInput) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      RESUME:
      ${resume.text}

      JOB DESCRIPTION:
      ${job.description}
    `,
    config: {
      systemInstruction: `You are a world-class HR analyst and career coach. 
      Your task is to analyze the provided resume against the job description.
      1. Calculate a match score (0-100) based on how well the candidate's skills and experience align with the requirements.
      2. Identify matching skills and missing key skills.
      3. Provide a brief professional reasoning for the score.
      4. Write a highly persuasive, 2-3 paragraph cover letter tailored specifically to this job, highlighting relevant experience from the resume. 
      Exclude name, address, and signature headers - start with 'Dear Hiring Manager'.
      Return the output strictly in JSON format.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          reasoning: { type: Type.STRING },
          coverLetter: { type: Type.STRING },
          matchingSkills: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          missingSkills: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          }
        },
        required: ["score", "reasoning", "coverLetter", "matchingSkills", "missingSkills"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const extractTextFromPdfPlaceholder = async (file: File): Promise<string> => {
  // In a real browser environment without a heavy PDF library, 
  // we would use pdf.js. For this demo, we use FileReader as a text fallback 
  // or simple simulation.
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string || "");
    };
    reader.readAsText(file);
  });
};
