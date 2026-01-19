
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const getGeminiResponse = async (prompt: string, role: string, systemInstruction: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 16000 }
      },
    });

    return response.text;
  } catch (error) {
    console.error(`Gemini Error (${role}):`, error);
    throw error;
  }
};

export const getStructuredOutput = async (prompt: string, schema: any) => {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("Structured Output Error:", error);
        throw error;
    }
}
