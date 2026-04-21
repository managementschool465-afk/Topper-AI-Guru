import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateDailyTasks(studentName: string, studentClass: string, subjects: string[], difficulty: string = "Easy") {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 3 study tasks for ${studentName} in class ${studentClass} for subjects: ${subjects.join(", ")}. Difficulty: ${difficulty}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            subject: { type: Type.STRING },
            mode: { type: Type.STRING, enum: ["Explain", "Practice", "Revision"] },
            difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] }
          },
          required: ["topic", "subject", "mode", "difficulty"]
        }
      }
    }
  });
  return JSON.parse(response.text);
}

export async function getStoryModeLesson(topic: string, subject: string, studentClass: string, studentName: string, personality: string = "Friendly") {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create an immersive "Story-Mode" lesson for ${studentName} (Class ${studentClass}) on "${topic}". In this story, the student is the main hero.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING },
          summary: { type: Type.STRING },
          questions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, hint: { type: Type.STRING } }, required: ["question", "hint"] } }
        },
        required: ["explanation", "summary", "questions"]
      }
    }
  });
  return JSON.parse(response.text);
}
