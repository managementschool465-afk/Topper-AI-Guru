import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { StudentProfile, StudyTask } from "../types";
import { generateDailyTasks, generateWeeklyTest, getDoubtAnswer } from "../services/geminiService";
import { voiceService } from "../services/voiceService";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Trophy, Star, Clock, Play, CheckCircle, Bell, Loader2, Sparkles, User, Flame, TrendingUp, Camera, FileText, HelpCircle, Send, Mic, MicOff, Award } from "lucide-react";
import Leaderboard from "./Leaderboard";
import Badges from "./Badges";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import VoiceTeacher from "./VoiceTeacher";
import CameraScanner from "./CameraScanner";

/**
 * Topper AI Guru - Student Dashboard
 * 
 * Yeh component student ka main landing area hai. 
 * Isme daily tasks, points, progress chart, aur doubt solvers shamil hain.
 */
export default function StudentDashboard({ profile }: { profile: StudentProfile }) {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<StudyTask | null>(null);
  const [reminderActive, setReminderActive] = useState(false);
  const [weeklyTest, setWeeklyTest] = useState<any[] | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [doubt, setDoubt] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [doubtAnswer, setDoubtAnswer] = useState<string | null>(null);
  const [isSolvingDoubt, setIsSolvingDoubt] = useState(false);

  const isSunday = new Date().getDay() === 0;

  useEffect(() => {
    if (!profile) return;

    const today = new Date().toISOString().split("T")[0];
    const q = query(collection(db, "tasks"), where("studentId", "==", profile.uid), where("date", "==", today));
    
    // real-time data fetching
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const taskData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StudyTask[];
      
      if (taskData.length === 0) {
        // Generate automatic tasks if none exist for today
        try {
          const newTasks = await generateDailyTasks(profile.name, profile.class, profile.subjects, profile.difficulty);
          for (const t of newTasks) {
            await addDoc(collection(db, "tasks"), {
              ...t,
              studentId: profile.uid,
              date: today,
              status: "Pending"
            });
          }
        } catch (error) {
          console.error("AI Generation failed:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setTasks(taskData);
        setLoading(false);
      }
    });

    // Reminder Timer check
    const checkReminder = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      if (currentTime === profile.studyTime && !reminderActive) {
        setReminderActive(true);
        voiceService.speak(`${profile.name}, uth jao! Padhai ka time ho gaya hai. Aapka teacher intezaar kar raha hai.`);
      }
    }, 60000);

    return () => {
      unsubscribe();
      clearInterval(checkReminder);
    };
  }, [profile]);

  // Handlers
  const handleScannerResult = (result: any, type: string) => {
    setShowScanner(false);
    if (type === "doubt") {
      setDoubtAnswer(result);
      voiceService.speak(result);
    }
  };

  const handleAskDoubt = async () => {
    if (!doubt) return;
    setIsSolvingDoubt(true);
    setDoubtAnswer(null);
    try {
      const answer = await getDoubtAnswer(doubt, profile.class, profile.personality);
      setDoubtAnswer(answer);
      await voiceService.speak(answer);
    } catch (err) {
      setDoubtAnswer("Maaf kijiye, Error aa gaya.");
    } finally {
      setIsSolvingDoubt(false);
    }
  };

  const toggleListen = async () => {
    if (isListening) {
      voiceService.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      try {
        const transcript = await voiceService.listen();
        setDoubt(transcript);
        setIsListening(false);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  // UI Rendering
  if (activeTask) {
    return (
      <VoiceTeacher
        task={activeTask}
        profile={profile}
        onComplete={() => setActiveTask(null)}
        onBack={() => setActiveTask(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50 p-6 font-sans">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-gradient text-white rounded-3xl shadow-xl flex items-center justify-center border-4 border-white bouncy">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Namaste, {profile.name}!</h1>
            <div className="flex gap-2">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black tracking-widest">Level {profile.level}</span>
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-[10px] font-black tracking-widest">{profile.xp} XP</span>
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 tracking-widest">
                <Flame className="w-3 h-3" /> {profile.streak} Day Streak
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowScanner(true)}
            className="w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 transition-all"
          >
            <Camera className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-3xl shadow-xl border-4 border-indigo-50">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span className="text-2xl font-black text-slate-900">{profile.points}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-32">
        <div className="lg:col-span-2 space-y-12">
          {/* Action Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => setShowScanner(true)} className="bg-white p-6 rounded-[32px] shadow-xl border-4 border-indigo-50 flex flex-col items-center gap-3 hover:border-indigo-200 transition-all group">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all"><Camera /></div>
              <span className="font-black text-slate-900 leading-tight">AI Scanner</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Scan Books</span>
            </button>
            <button onClick={() => setShowScanner(true)} className="bg-white p-6 rounded-[32px] shadow-xl border-4 border-orange-50 flex flex-col items-center gap-3 hover:border-orange-200 transition-all group">
              <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all"><FileText /></div>
              <span className="font-black text-slate-900 leading-tight">HW Solver</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Get Help</span>
            </button>
            <button onClick={() => document.getElementById('doubt-input')?.focus()} className="bg-white p-6 rounded-[32px] shadow-xl border-4 border-purple-50 flex flex-col items-center gap-3 hover:border-purple-200 transition-all group">
              <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-all"><HelpCircle /></div>
              <span className="font-black text-slate-900 leading-tight">Ask Doubt</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Talk to AI</span>
            </button>
          </section>

          {/* Task List */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-indigo-600" /> Aaj ka Study Plan
              </h2>
              <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                <Clock className="w-4 h-4" /> {profile.studyTime}
              </div>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    whileHover={{ y: -8 }}
                    className={`bg-white p-8 rounded-[40px] shadow-xl border-4 transition-all ${
                      task.status === "Completed" ? "border-green-100 opacity-75" : "border-indigo-50"
                    }`}
                  >
                    <h3 className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">{task.subject}</h3>
                    <h4 className="text-xl font-black text-slate-900 mb-8">{task.topic}</h4>
                    {task.status === "Pending" && (
                      <button 
                        onClick={() => setActiveTask(task)}
                        className="w-full bg-indigo-gradient text-white font-black py-4 rounded-3xl"
                      >
                        Start Learning
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Doubt Section */}
          <section className="bg-purple-gradient p-8 rounded-[40px] shadow-xl text-white">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <HelpCircle className="w-6 h-6" /> Doubt Solver
            </h2>
            <div className="relative mb-6">
              <input 
                id="doubt-input" type="text" value={doubt} onChange={(e) => setDoubt(e.target.value)}
                placeholder="Koi doubt ho toh poochein..."
                className="w-full bg-white/20 border-2 border-white/30 rounded-2xl py-4 pl-6 pr-24 text-white placeholder:text-white/60 font-bold focus:outline-none"
              />
              <div className="absolute right-2 top-2 flex gap-2">
                <button onClick={toggleListen} className={`p-2 rounded-xl ${isListening ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`}>
                  {isListening ? <MicOff /> : <Mic />}
                </button>
                <button onClick={handleAskDoubt} disabled={isSolvingDoubt} className="p-2 bg-white text-purple-600 rounded-xl">
                  {isSolvingDoubt ? <Loader2 className="animate-spin" /> : <Send />}
                </button>
              </div>
            </div>
            {doubtAnswer && <p className="bg-white/10 p-6 rounded-3xl border border-white/20 font-bold leading-relaxed">{doubtAnswer}</p>}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
           <Badges badges={profile.badges} />
           <Leaderboard currentUserId={profile.uid} />
        </aside>
      </main>

      <AnimatePresence>
        {showScanner && (
          <CameraScanner 
            onClose={() => setShowScanner(false)} 
            onResult={handleScannerResult}
            studentName={profile.name}
          />
        )}
        {reminderActive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-indigo-900/80 backdrop-blur-sm">
            <div className="bg-white p-12 rounded-[50px] shadow-2xl text-center max-w-md w-full border-8 border-indigo-100">
              <Bell className="w-16 h-16 text-indigo-600 mx-auto mb-8 animate-bounce" />
              <h2 className="text-4xl font-black text-slate-900 mb-4">Uth Jao, {profile.name}!</h2>
              <button onClick={() => setReminderActive(false)} className="w-full bg-indigo-gradient text-white font-black py-6 rounded-3xl shadow-2xl">Chalo Padhte Hain!</button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
