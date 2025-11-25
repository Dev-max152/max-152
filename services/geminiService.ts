import { GoogleGenAI, Type, Schema } from "@google/genai";
import { HomeworkResponse } from "../types";

// Schema for structured JSON output
const homeworkSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    transcription: {
      type: Type.STRING,
      description: "The extracted homework question text.",
    },
    explanation: {
      type: Type.STRING,
      description: "A simple, clear, step-by-step explanation for a beginner student.",
    },
  },
  required: ["transcription", "explanation"],
};

const getClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeHomework = async (base64Image: string): Promise<HomeworkResponse> => {
  const ai = getClient();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: `You are an expert study buddy.
            1. Analyze the image and extract the homework question text exactly (OCR).
            2. Explain the homework question step-by-step in a simple, clear way that a beginner student can understand.
            
            Return the result in JSON format with "transcription" and "explanation" fields.`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: homeworkSchema,
        temperature: 0.4,
      },
    });

    return parseResponse(response.text);

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze homework. Please try again or ensure the image is clear.");
  }
};

export const explainText = async (text: string): Promise<HomeworkResponse> => {
  const ai = getClient();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            text: `You are an expert study buddy.
            The student has asked the following question: "${text}"
            
            Explain this question step-by-step in a simple, clear way that a beginner student can understand.
            
            Return the result in JSON format with "transcription" (the original question) and "explanation" fields.`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: homeworkSchema,
        temperature: 0.4,
      },
    });

    return parseResponse(response.text);

  } catch (error) {
    console.error("Gemini Text Analysis Error:", error);
    throw new Error("Failed to explain the question. Please try again.");
  }
};

const parseResponse = (text: string | undefined): HomeworkResponse => {
    let cleanText = text || "";
    // Remove markdown code blocks if present to ensure valid JSON parsing
    cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();

    if (cleanText) {
      return JSON.parse(cleanText) as HomeworkResponse;
    }
    throw new Error("No response from AI.");
};