import React, { useEffect, useState } from "react";
import { StudentProfile } from "../types";
import { getParentReport } from "../services/geminiService";
import { Brain, Heart, Lightbulb, Sparkles, Loader2 } from "lucide-react";
import { motion } from "motion/react";

export default function ParentInsights({ profile }: { profile: StudentProfile }) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getParentReport(profile.name, profile.class, profile.points, profile.level, profile.streak, profile.weakTopics)
      .then(setReport).finally(() => setLoading(false));
  }, [profile]);

  if (loading) return <div className="bg-white p-12 rounded-[40px] flex items-center justify-center gap-4"><Loader2 className="animate-spin text-indigo-600" /> Loading AI Insights...</div>;

  return (
    <div className="space-y-8">
      <div className="bg-indigo-gradient p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
        <Sparkles className="absolute top-4 right-4 opacity-20" />
        <h2 className="text-2xl font-black mb-4 flex items-center gap-3"><Brain /> AI Parent Analysis</h2>
        <p className="font-bold text-lg leading-relaxed">{report?.summary}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border-4 border-orange-50 shadow-xl">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2"><Lightbulb className="text-orange-500" /> Expert Advice</h3>
            <p className="text-slate-600 font-bold">{report?.advice}</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border-4 border-purple-50 shadow-xl">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2"><Heart className="text-purple-500" /> Parent Motivation</h3>
            <p className="text-slate-600 font-bold italic">"{report?.motivation}"</p>
        </div>
      </div>
    </div>
  );
}
