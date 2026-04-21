import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { StudentProfile, StudyTask } from "../types";
import { generateDailyTasks } from "../services/geminiService";
import VoiceTeacher from "./VoiceTeacher";
import CameraScanner from "./CameraScanner";
import Leaderboard from "./Leaderboard";
import Badges from "./Badges";
import { motion } from "motion/react";
import { Book, Play, Camera, Star, Zap, LayoutDashboard, Trophy } from "lucide-react";

export default function StudentDashboard({ profile }: { profile: StudentProfile }) {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [activeTask, setActiveTask] = useState<StudyTask | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [activeTab, setActiveTab] = useState<"study" | "leaderboard">("study");

  useEffect(() => {
    const q = query(collection(db, "tasks"), where("studentId", "==", profile.uid));
    const unsubscribe = onSnapshot(q, async (snap) => {
      const taskList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyTask));
      if (taskList.length === 0) {
        const newTasks = await generateDailyTasks(profile.name, profile.class, profile.subjects);
        for (const task of newTasks) {
          await addDoc(collection(db, "tasks"), { ...task, studentId: profile.uid, status: "Pending", date: new Date().toISOString() });
        }
      } else {
        setTasks(taskList);
      }
    });
    return () => unsubscribe();
  }, [profile]);

  return (
    <div className="pb-32 p-6 max-w-4xl mx-auto space-y-8">
      {/* Header Stats */}
      <div className="flex items-center justify-between bg-indigo-gradient p-8 rounded-[40px] text-white shadow-2xl">
        <div className="space-y-1">
          <p className="text-sm font-black opacity-80 uppercase tracking-widest">Level {profile.level}</p>
          <h1 className="text-3xl font-black">नमस्ते, {profile.name}! 👋</h1>
        </div>
        <div className="flex gap-4">
            <div className="bg-white/20 px-4 py-2 rounded-2xl flex items-center gap-2"><Star className="w-5 h-5 text-amber-300" /> <span className="font-black">{profile.points}</span></div>
            <div className="bg-white/20 px-4 py-2 rounded-2xl flex items-center gap-2"><Zap className="w-5 h-5 text-orange-300" /> <span className="font-black">{profile.streak}</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 p-2 bg-white rounded-3xl shadow-lg border-4 border-indigo-50">
        <button onClick={() => setActiveTab("study")} className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${activeTab === "study" ? "bg-indigo-600 text-white" : "text-slate-400"}`}><LayoutDashboard className="w-5 h-5" /> My Study</button>
        <button onClick={() => setActiveTab("leaderboard")} className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${activeTab === "leaderboard" ? "bg-indigo-600 text-white" : "text-slate-400"}`}><Trophy className="w-5 h-5" /> Leaderboard</button>
      </div>

      {activeTab === "study" ? (
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">आज का काम (Daily Tasks) 📋</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tasks.filter(t => t.status === "Pending").map((task) => (
                <motion.div key={task.id} whileHover={{ y: -5 }} className="bg-white p-6 rounded-[35px] shadow-xl border-4 border-white flex justify-between items-center">
                  <div><p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{task.subject}</p> <h3 className="text-xl font-black text-slate-900">{task.topic}</h3></div>
                  <button onClick={() => setActiveTask(task)} className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all"><Play className="w-6 h-6" /></button>
                </motion.div>
              ))}
            </div>
          </section>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button onClick={() => setShowScanner(true)} className="bg-white p-12 rounded-[40px] shadow-xl border-4 border-dashed border-indigo-200 flex flex-col items-center justify-center gap-4 transition-all hover:bg-indigo-50">
              <div className="p-6 bg-indigo-100 text-indigo-600 rounded-3xl"><Camera className="w-12 h-12" /></div>
              <h3 className="text-2xl font-black text-slate-900">Homework Scan Karein 📸</h3>
            </button>
            <Badges badges={profile.badges} />
          </div>
        </div>
      ) : (
        <Leaderboard currentUserId={profile.uid} />
      )}

      {activeTask && <VoiceTeacher task={activeTask} profile={profile} onClose={() => setActiveTask(null)} />}
      {showScanner && <CameraScanner onClose={() => setShowScanner(false)} onResult={(res) => console.log(res)} />}
    </div>
  );
}
