import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { StudentProfile, UserRole } from "./types";
import ParentDashboard from "./components/ParentDashboard";
import StudentDashboard from "./components/StudentDashboard";
import SplashScreen from "./components/SplashScreen";
import { motion, AnimatePresence } from "motion/react";
import { LogIn, Sparkles, Loader2, GraduationCap, Users, ShieldAlert, Trophy } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 🏆 Gamification States
  const [xp, setXp] = useState(() => Number(localStorage.getItem("student_xp")) || 0);

  useEffect(() => {
    // Save XP to local storage whenever it changes
    localStorage.setItem("student_xp", xp.toString());
  }, [xp]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const profileRef = doc(db, "profiles", firebaseUser.uid);
        
        const unsubProfile = onSnapshot(profileRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data() as StudentProfile;
            setProfile(data);
            // Agar view set nahi hai, toh default Student mode
            if (!view) setView("Student");
          } else {
            // New user setup trigger
            setView("Parent");
          }
          setLoading(false);
        }, (err) => {
          console.error("Firestore Error:", err);
          setError("Data load nahi ho paya. Internet check karein.");
          setLoading(false);
        });
        
        return () => unsubProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [view]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError("Login fail: " + err.message);
    }
  };

  // ✅ XP Badhane ka function (Dashboards mein pass karne ke liye)
  const addXP = (amount: number) => {
    setXp(prev => prev + amount);
  };

  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="font-bold tracking-widest text-xs opacity-50">GYANGURU SYSTEM INITIALIZING...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-[40px] shadow-2xl text-center max-w-sm border-4 border-red-50">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-2">System Error!</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl">Restart App</button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-white rounded-[60px] p-10 text-center shadow-2xl">
          <div className="w-20 h-20 bg-indigo-600 rounded-[25px] flex items-center justify-center mx-auto mb-6 rotate-3">
            <Sparkles className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">GyanGuru AI</h1>
          <p className="text-slate-400 font-bold mb-10 italic">"Bano Desh Ka Agla Topper" 🇮🇳</p>
          <button onClick={handleLogin} className="w-full bg-indigo-600 text-white font-black text-lg py-5 rounded-3xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
            <LogIn className="w-5 h-5" /> Google Se Shuru Karein
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* 🚀 Header with XP Badge */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-3 bg-white px-5 py-2 rounded-full shadow-sm border border-slate-100">
           <Trophy className="w-5 h-5 text-orange-500" />
           <span className="font-black text-slate-700">{xp} XP</span>
        </div>
        <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border-2 border-indigo-200" />
      </header>

      {/* 🧭 Navigation Dock (Mobile-First) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-xl border border-slate-200 p-2 rounded-full shadow-2xl flex gap-2">
        <button onClick={() => setView("Student")} className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${view === "Student" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400"}`}>
          <GraduationCap className="w-5 h-5" />
          <span className="font-black text-[10px] uppercase">Padhai</span>
        </button>
        <button onClick={() => setView("Parent")} className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${view === "Parent" ? "bg-orange-500 text-white shadow-lg" : "text-slate-400"}`}>
          <Users className="w-5 h-5" />
          <span className="font-black text-[10px] uppercase">Settings</span>
        </button>
      </nav>

      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
          {view === "Parent" ? (
            <ParentDashboard profile={profile} onUpdate={() => setView("Student")} />
          ) : profile ? (
            <StudentDashboard profile={profile} addXP={addXP} />
          ) : (
            <div className="p-10 text-center">
              <h2 className="text-2xl font-black">Profile Setup Required!</h2>
              <button onClick={() => setView("Parent")} className="mt-4 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold">Setup Now</button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
