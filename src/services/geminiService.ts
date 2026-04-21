import { GoogleGenerativeAI } from "@google/genai";

/**
 * Topper AI Guru - Gemini AI Service
 * 
 * Yeh service AI responses (lessons, tests, homework solutions, doubts) ko 
 * manage karti hai. Isme advanced prompt engineering ka use gaya hai 
 * taaki result hamesha student-friendly aur "Hinglish" mein ho.
 */

// Initialize Gemini with the API Key from environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * generateDailyTasks
 * Rozana ke study goals create karta hai.
 */
export async function generateDailyTasks(studentName: string, studentClass: string, subjects: string[], difficulty: string = "Easy") {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Generate 3 specific study tasks for ${studentName} who is in class ${studentClass}. 
  Subjects: ${subjects.join(", ")}. 
  Difficulty Level: ${difficulty}. 
  For each task, decide if it's "Explain" (new concept), "Practice" (problems), or "Revision" (re-cap).
  Output must be a valid JSON array of objects with keys: topic, subject, mode, difficulty.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Task generation failed:", error);
    // Fallback static tasks
    return [
      { topic: "Basic Addition", subject: "Maths", mode: "Practice", difficulty: "Easy" },
      { topic: "Solar System", subject: "Science", mode: "Explain", difficulty: "Easy" }
    ];
  }
}

/**
 * getLessonContent
 * Kisi topic ka purra explanation aur questions generate karta hai.
 */
export async function getLessonContent(topic: string, subject: string, studentClass: string, personality: string = "Friendly") {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Explain "${topic}" in "${subject}" for a class ${studentClass} student. 
  Tone: ${personality}. Language: Hindi (Hinglish). 
  Include: 
  1. High-quality simple explanation.
  2. A 2-sentence summary for the student to write down.
  3. 3 interactive questions with hints.
  Return as a clean JSON object with keys: explanation, summary, questions (array of {question, hint}).`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}

/**
 * evaluateAnswer
 * Student ke answer ko check karke friendly feedback deta hai.
 */
export async function evaluateAnswer(question: string, studentAnswer: string, personality: string = "Friendly") {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Question: ${question}. Student Answer: ${studentAnswer}. 
  Tone: ${personality}. Language: Hinglish.
  Evaluate if the answer is conceptually correct.
  Return JSON: { isCorrect: boolean, feedback: string, hint: string }`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}

/**
 * getStoryModeLesson
 * Adventure story format mein padhai karwata hai.
 */
export async function getStoryModeLesson(topic: string, subject: string, studentClass: string, studentName: string, personality: string = "Friendly") {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Create an adventure story for ${studentName} where learning "${topic}" helps them win.
  Language: Hinglish. Must include summary and 3 questions.
  Return JSON object.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}

/**
 * getDoubtAnswer
 * Instant voice/text chat doubt solver.
 */
export async function getDoubtAnswer(doubt: string, studentClass: string, personality: string = "Friendly") {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Student asked: "${doubt}". They are in class ${studentClass}. 
  Answer like a ${personality} teacher in simple Hinglish.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * getParentReport
 * Parents ke liye formal progress report.
 */
export async function getParentReport(studentName: string, studentClass: string, points: number, level: number, streak: number, weakTopics: string[]) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Generate a report for parents of ${studentName}. Stats: ${points} pts, Level ${level}, Streak ${streak}. 
  Weak topics: ${weakTopics.join(", ")}.
  Return JSON: { summary: string, advice: string, motivation: string } in Hinglish.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}

/**
 * generateWeeklyTest
 */
export async function generateWeeklyTest(studentName: string, studentClass: string, subjects: string[]) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Create a 5-question MCQ test for ${studentName} (Class ${studentClass}) on ${subjects.join(", ")}.
  Return JSON array of { question, options, correctAnswer }.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}
