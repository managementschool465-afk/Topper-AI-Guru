import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { StudentProfile } from "../types";
import { motion } from "motion/react";
import { Settings, Save, User, Book, Clock, TrendingUp, Sparkles } from "lucide-react";
import ParentInsights from "./ParentInsights";

/**
 * Topper AI Guru - Parent Dashboard
 * 
 * Parents yahan se student ka profile setup karte hain aur unki basic data entry karte hain.
 * Performance insights aur AI customization controls yahan available hain.
 */
export default function ParentDashboard({ profile, onUpdate }: { profile: StudentProfile | null, onUpdate: () => void }) {
  const [name, setName] = useState(profile?.name || "");
  const [studentClass, setStudentClass] = useState(profile?.class || "");
  const [subjects, setSubjects] = useState(profile?.subjects?.join(", ") || "");
  const [studyTime, setStudyTime] = useState(profile?.studyTime || "08:00");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">(profile?.difficulty || "Easy");
  const [personality, setPersonality] = useState<"Friendly" | "Strict" | "Fun">(profile?.personality || "Friendly");
  const [loading, setLoading] = useState(false);

  // Handle Profile Update
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);

    const newProfile: StudentProfile = {
      uid: auth.currentUser.uid,
      name,
      class: studentClass,
      subjects: subjects.split(",").map(s => s.trim()),
      studyTime,
      points: profile?.points || 0,
      xp: profile?.xp || 0,
      level: profile?.level || 1,
      badges: profile?.badges || [],
      parentEmail: auth.currentUser.email || "",
      streak: profile?.streak || 0,
      lastStudyDate: profile?.lastStudyDate || null,
      difficulty,
      personality,
      weakTopics: profile?.weakTopics || []
    };

    try {
      await setDoc(doc(db, "profiles", auth.currentUser.uid), newProfile);
      onUpdate();
    } catch (error) {
      console.error("Profile saving error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 pb-32">
        {/* Performance Overview (Already existing profile) */}
        {profile && (
          <div className="space-y-12">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-indigo-50"
            >
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-indigo-600" /> Student Progress
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-50 p-6 rounded-3xl text-center">
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Points</span>
                  <p className="text-3xl font-black text-indigo-700">{profile.points}</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-3xl text-center">
                  <span className="text-xs font-black text-orange-400 uppercase tracking-widest">Streak</span>
                  <p className="text-3xl font-black text-orange-700">{profile.streak} Days</p>
                </div>
                <div className="bg-green-50 p-6 rounded-3xl text-center">
                  <span className="text-xs font-black text-green-400 uppercase tracking-widest">Level</span>
                  <p className="text-3xl font-black text-green-700">{profile.level}</p>
                </div>
              </div>
            </motion.section>

            <ParentInsights profile={profile} />
          </div>
        )}

        {/* Configuration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] shadow-xl p-8 border-4 border-orange-100"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
              <Settings className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Student Configuration</h1>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Student Ki Pehchan</label>
                <input
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none font-bold"
                  placeholder="Naam likhein"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Kaunsi Class?</label>
                <input
                  type="text" required value={studentClass} onChange={(e) => setStudentClass(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none font-bold"
                  placeholder="e.g. 5th Standard"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Subjects (Comma se separate karein)</label>
              <input
                type="text" required value={subjects} onChange={(e) => setSubjects(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none font-bold"
                placeholder="Maths, Science, English..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Study Time</label>
                <input
                  type="time" required value={studyTime} onChange={(e) => setStudyTime(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Mushkil Level</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 font-bold outline-none">
                  <option value="Easy">Aasan</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Mushkil</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Teacher Style</label>
                <select value={personality} onChange={(e) => setPersonality(e.target.value as any)} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 font-bold outline-none">
                  <option value="Friendly">Dost Jaisa</option>
                  <option value="Fun">Maze wala</option>
                  <option value="Strict">Strict Disciplined</option>
                </select>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-orange-gradient text-white font-black py-6 rounded-[30px] shadow-xl text-xl hover:scale-[1.02] transition-all"
            >
              {loading ? "Saving Progress..." : "Save Settings & Get Started"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
              }
