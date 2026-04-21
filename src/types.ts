export type UserRole = "Parent" | "Student";

export interface StudentProfile {
  uid: string;
  name: string;
  class: string;
  subjects: string[];
  studyTime: string;
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
