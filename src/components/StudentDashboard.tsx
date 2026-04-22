import { GoogleGenerativeAI } from "@google/generative-ai";

// API Key Initialization
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * 🎓 GYAN GURU - STRICT MODE PROMPT LOGIC
 */

// 1. Daily Task Generator (Personalized for the student)
export const generateDailyTasks = async (name: string, studentClass: string, subjects: string[], difficulty: string) => {
  const prompt = `
    Context: Act as a world-class AI Tutor "GyanGuru".
    Target: Create 4 specific study tasks for ${name}, who is in class ${studentClass}.
    Subjects: ${subjects.join(", ")}. 
    Difficulty Level: ${difficulty}.
    
    Task Rules:
    - Each task must have a 'topic' and a 'subject'.
    - Topics should be relevant to the class curriculum.
    - Format: JSON array of objects like { subject: "Math", topic: "Quadratic Equations" }.
    - Return ONLY the JSON array.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text().replace(/```json|```/g, ""));
  } catch (error) {
    console.error("Task Generation Error:", error);
    return [];
  }
};

// 2. Strict Doubt Solver (The "Guru" Logic)
export const getDoubtAnswer = async (question: string, studentClass: string, personality: string, mode: "EXPLAIN" | "VERIFY" = "EXPLAIN") => {
  
  // Strict Mode Prompt: Never give answers directly, always challenge the student.
  const systemPrompt = mode === "EXPLAIN" 
    ? `
    Role: You are GyanGuru, a strict but friendly Super AI Teacher.
    Goal: Explain the concept and then VERIFY understanding.
    
    Instruction:
    1. Language: Use a mix of Hindi and English (Hinglish).
    2. Explanation: Start with a real-life analogy (Asli zindagi ka udharan).
    3. No Direct Answers: Don't just give the answer; explain the 'Why'.
    4. Mandatory Hook: After your explanation, you MUST end with this exact phrase: 
       "Ab aap ise apne shabdon mein samjhaiye (Explain in your own words) taki main dekhun aapne kya samjha?"
    5. Tone: Be like a mentor.
    `
    : `
    Role: Verification Mode.
    Goal: Check if the student's explanation is correct.
    
    Instruction:
    - If the student's explanation is correct, start with "PERFECT" and award 20 XP.
    - If it's wrong, start with "RETRY" and explain it in an even simpler way (Explain to a 5-year-old).
    `;

  const finalPrompt = `${systemPrompt} \n Student Question/Explanation: "${question}" \n Class: ${studentClass}`;

  try {
    const result = await model.generateContent(finalPrompt);
    return result.response.text();
  } catch (error) {
    return "Maaf kijiye, server busy hai. Thodi der baad try karein.";
  }
};

// 3. Image Analysis (OCR Upgrade)
export const analyzeImage = async (base64Image: string, studentClass: string) => {
  const prompt = `
    Analyze this image. It contains a student's question or notes.
    1. Identify all questions in the image.
    2. If there are multiple topics, list them separately.
    3. Explain the first question in detail using Hinglish and an analogy.
    4. End with: "Kya aap chahte hain ki main agla sawaal samjhaun?"
  `;

  try {
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
    ]);
    return result.response.text();
  } catch (error) {
    return "Photo saaf nahi hai, kripya dobara kheenchiye.";
  }
};
