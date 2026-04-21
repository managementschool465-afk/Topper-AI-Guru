import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { StudentProfile } from "../types";
import ParentInsights from "./ParentInsights";
import { motion } from "motion/react";
import { Settings, Save, User, Book, Clock, TrendingUp } from "lucide-react";

export default function ParentDashboard({ profile, onUpdate }: { profile: StudentProfile | null, onUpdate: () => void }) {
  const [name, setName] = useState(profile?.name || "");
  const [studentClass, setStudentClass] = useState(profile?.class || "");
  const [subjects, setSubjects] = useState(profile?.subjects?.join(", ") || "");
  const [difficulty, setDifficulty] = useState<any>(profile?.difficulty || "Easy");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    const newProfile: StudentProfile = {
      uid: auth.currentUser.uid,
      name, class: studentClass,
      subjects: subjects.split(",").map(s => s.trim()),
      studyTime: profile?.studyTime || "08:00",
      points: profile?.points || 0, xp: profile?.xp || 0, level: profile?.level || 1,
      badges: profile?.badges || [], parentEmail: auth.currentUser.email || "",
      streak: profile?.streak || 0, lastStudyDate: profile?.lastStudyDate || null,
      difficulty, personality: profile?.personality || "Friendly", weakTopics: profile?.weakTopics || []
    };
    await setDoc(doc(db, "profiles", auth.currentUser.uid), newProfile);
    onUpdate();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-orange-50 p-6 space-y-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {profile && (
            <div className="space-y-12">
                <section className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-indigo-50">
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><TrendingUp className="text-indigo-600" /> Student Progress</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="bg-indigo-50 p-6 rounded-3xl"><p className="text-3xl font-black">{profile.points}</p><p className="text-xs uppercase font-black text-indigo-400">Total Points</p></div>
                        <div className="bg-orange-50 p-6 rounded-3xl"><p className="text-3xl font-black">{profile.streak} Days</p><p className="text-xs uppercase font-black text-orange-400">Current Streak</p></div>
                        <div className="bg-green-50 p-6 rounded-3xl"><p className="text-3xl font-black">Lvl {profile.level}</p><p className="text-xs uppercase font-black text-green-400">Current Level</p></div>
                    </div>
                </section>
                <ParentInsights profile={profile} />
            </div>
        )}

        <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-orange-100">
          <h1 className="text-2xl font-black mb-8 flex items-center gap-3"><Settings className="text-orange-500" /> Parent Settings</h1>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-4 rounded-xl border border-slate-200" placeholder="Student Name" required />
                <input type="text" value={studentClass} onChange={(e) => setStudentClass(e.target.value)} className="w-full p-4 rounded-xl border border-slate-200" placeholder="Class / Grade" required />
            </div>
            <input type="text" value={subjects} onChange={(e) => setSubjects(e.target.value)} className="w-full p-4 rounded-xl border border-slate-200" placeholder="Subjects (Maths, Science...)" required />
            <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white py-5 rounded-3xl font-black text-xl">{loading ? "Saving..." : "Save Settings 💾"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
