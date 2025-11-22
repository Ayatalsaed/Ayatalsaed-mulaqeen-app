import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const translateCommands = async (prompt: string): Promise<string[]> => {
  if (!apiKey) {
    console.warn("No API Key provided");
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Translate the following natural language robot instructions (in Arabic or English) into a JSON array of commands. 
      Available commands: "FORWARD", "BACKWARD", "TURN_LEFT", "TURN_RIGHT", "WAIT".
      Example Input: "تحرك خطوتين للامام ثم لف يمين"
      Example Output: ["FORWARD", "FORWARD", "TURN_RIGHT"]
      Input: ${prompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            enum: ["FORWARD", "BACKWARD", "TURN_LEFT", "TURN_RIGHT", "WAIT"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};

export const getAssistantHelp = async (query: string): Promise<string> => {
  if (!apiKey) return "عذراً، مفتاح API غير متوفر.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a helpful robotic programming tutor named "Mulaqqen AI". Answer the user's question about robotics, coding, or the platform in Arabic. Keep it concise and encouraging. Question: ${query}`,
    });
    return response.text || "لم أستطع معالجة طلبك.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "حدث خطأ في الاتصال بالمعلم الذكي.";
  }
};