/**
 * Topper AI Guru - Type Definitions
 * 
 * Saare application parameters, profile structures, aur 
 * task formats yahan define kiye gaye hain.
 */

export type UserRole = "Parent" | "Student";

/**
 * Student Profile Structure
 * AI behavior aur personalization ke liye essential fields.
 */
export interface StudentProfile {
  uid: string;
  name: string;
  class: string;
  subjects: string[];
  studyTime: string; // HH:mm format
  points: number;
  xp: number;
  level: number;
  badges: string[];
  parentEmail: string;
  streak: number;
  lastStudyDate: string | null;
  difficulty: "Easy" | "Medium" | "Hard";
  personality: "Friendly" | "Strict" | "Fun";
  weakTopics: string[];
}

/**
 * Study Task Definition
 * Ek single learning module ya assignment.
 */
export interface StudyTask {
  id: string;
  studentId: string;
  topic: string;
  subject: string;
  status: "Pending" | "Completed";
  date: string;
  summary?: string;
  mode: "Explain" | "Practice" | "Revision" | "Test" | "Homework" | "Scanner" | "StoryMode";
  difficulty: "Easy" | "Medium" | "Hard";
}

/**
 * Book / Scanner Data
 * Kitab ki photo se extracted information.
 */
export interface BookPage {
  id: string;
  studentId: string;
  bookTitle: string;
  chapterTitle?: string;
  imageUrl: string;
  ocrText?: string;
  summary?: string;
  createdAt: string;
}

/**
 * School / Classwork Report
 * Rozana ke school work ka record.
 */
export interface Classwork {
  id: string;
  studentId: string;
  date: string;
  imageUrl: string;
  subject: string;
  topic: string;
  summary: string;
  createdAt: string;
}

/**
 * Result tracking
 */
export interface TestResult {
  id: string;
  studentId: string;
  subject: string;
  score: number;
  total: number;
  date: string;
  type: "Daily" | "Weekly";
}
