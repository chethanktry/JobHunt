
import { GoogleGenAI, Type } from "@google/genai";
import { JobInput, Resume } from "../types";

export const analyzeJobMatch = async (resume: Resume, job: JobInput) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      job_description: ${job.description}
      my_resume: ${resume.text}
    `,
    config: {
      systemInstruction: `You are an expert HR recruitment specialist and technical career coach. 
      Your goal is to evaluate a candidate's resume against a specific job description.

      MATCH ANALYSIS:
      - Calculate a realistic match score from 0 to 100. Be strict but fair.
      - Identify key technical and soft skills present in the resume that match the job.
      - Identify critical skills or experiences mentioned in the job description that are missing from the resume.
      - Provide a concise (1-2 sentence) professional justification for the score.

      COVER LETTER GENERATION:
      - Write a highly tailored, professional cover letter (2-3 paragraphs).
      - Do NOT use generic placeholders like [Your Name] or [Company Name]. Use the provided info where available.
      - The letter should focus on 'how' the candidate's specific background solves the company's needs described in the job post.
      - Start directly with 'Dear Hiring Manager,' and end with a professional closing. Exclude all header contact information.

      The output must be a valid JSON object.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          reasoning: { type: Type.STRING },
          coverLetter: { type: Type.STRING },
          matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["score", "reasoning", "coverLetter", "matchingSkills", "missingSkills"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const extractTextFromPdfPlaceholder = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string || "";
      resolve(content.replace(/\s+/g, ' ').trim());
    };
    reader.readAsText(file);
  });
};
