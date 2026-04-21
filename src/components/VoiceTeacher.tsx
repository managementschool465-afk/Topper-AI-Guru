import React, { useState } from "react";
import { StudyTask, StudentProfile } from "../types";
import { getStoryModeLesson, getLessonContent } from "../services/geminiService";
import { voiceService } from "../services/voiceService";
import { motion } from "motion/react";
import { Play, Sparkles, X, BookOpen, Loader2 } from "lucide-react";

export default function VoiceTeacher({ task, profile, onClose }: { task: StudyTask, profile: StudentProfile, onClose: () => void }) {
  const [step, setStep] = useState<"intro" | "explaining" | "finished">("intro");
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState<any>(null);

  const startLesson = async () => {
    setLoading(true);
    const data = await getStoryModeLesson(task.topic, task.subject, profile.class, profile.name);
    setLesson(data);
    setStep("explaining");
    await voiceService.speak(data.explanation);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-indigo-900/95 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-2xl rounded-[50px] shadow-2xl relative border-8 border-white/20 p-12 text-center">
        <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-slate-100 rounded-full"><X className="w-6 h-6" /></button>
        {step === "intro" && (
            <div className="space-y-8">
                <div className="w-24 h-24 bg-indigo-gradient rounded-3xl mx-auto flex items-center justify-center bouncy"><BookOpen className="w-12 h-12 text-white" /></div>
                <h2 className="text-4xl font-black">Ready to Learn?</h2>
                <p className="text-xl text-slate-500">Topic: <span className="text-indigo-600">{task.topic}</span></p>
                <button onClick={startLesson} className="w-full bg-indigo-gradient text-white py-6 rounded-3xl text-2xl font-black">
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : "Start Lesson 🚀"}
                </button>
            </div>
        )}
        {step === "explaining" && (
            <div className="space-y-8">
                <div className="w-48 h-48 bg-indigo-100 rounded-full mx-auto flex items-center justify-center animate-pulse"><Sparkles className="w-24 h-24 text-indigo-600" /></div>
                <h3 className="text-2xl font-black">Teacher is explaining...</h3>
                <div className="bg-slate-50 p-6 rounded-3xl text-left max-h-48 overflow-y-auto"><p className="font-bold text-slate-600">{lesson?.explanation}</p></div>
            </div>
        )}
      </div>
    </div>
  );
}
