import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";
import { StudentProfile, UserRole } from "./types";
import ParentDashboard from "./components/ParentDashboard";
import StudentDashboard from "./components/StudentDashboard";
import SplashScreen from "./components/SplashScreen";
import { motion, AnimatePresence } from "motion/react";
import { LogIn, Sparkles, Loader2, GraduationCap, Users } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<UserRole | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        const profileRef = doc(db, "profiles", user.uid);
        const unsubProfile = onSnapshot(profileRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data() as StudentProfile;
            setProfile(data);
            // Agar pehli baar login hai toh default Student view
            if (!view) setView("Student");
          } else {
            // Agar profile nahi hai toh Parent setup par bhejein
            setView("Parent");
          }
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

  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50 p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white rounded-[50px] shadow-2xl p-12 text-center border-8 border-white">
        <div className="w-24 h-24 bg-indigo-gradient text-white rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-100 bouncy">
          <Sparkles className="w-12 h-12" />
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">Topper AI Guru 🏆</h1>
        <p className="text-slate-500 font-bold mb-12">Padho Smart, Bano Topper 🚀<br/>Aapka personal AI teacher!</p>
        <button onClick={handleLogin} className="w-full flex items-center justify-center gap-4 bg-indigo-gradient text-white font-black text-xl py-6 rounded-3xl shadow-2xl shadow-indigo-100 hover:scale-105 transition-all outline-none">
          <LogIn className="w-6 h-6" /> Google Se Login
        </button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-indigo-50 font-sans antialiased pb-32">
      {/* Dynamic Navigation Bar */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-white/90 backdrop-blur-xl border-4 border-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-8">
        <button
          onClick={() => setView("Student")}
          className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all ${view === "Student" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 font-bold"}`}
        >
          <GraduationCap className="w-5 h-5" />
          <span className="font-black text-[10px] uppercase tracking-widest">Student</span>
        </button>
        <button
          onClick={() => setView("Parent")}
          className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all ${view === "Parent" ? "bg-orange-500 text-white shadow-lg" : "text-slate-400 font-bold"}`}
        >
          <Users className="w-5 h-5" />
          <span className="font-black text-[10px] uppercase tracking-widest">Parent</span>
        </button>
      </nav>

      {/* View Switcher with Smooth Animation */}
      <AnimatePresence mode="wait">
        {view === "Parent" ? (
          <motion.div key="parent" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <ParentDashboard profile={profile} onUpdate={() => setView("Student")} />
          </motion.div>
        ) : profile ? (
          <motion.div key="student" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <StudentDashboard profile={profile} />
          </motion.div>
        ) : (
          <div className="min-h-screen flex items-center justify-center p-12 text-center">
            <div className="max-w-md bg-white p-12 rounded-[40px] shadow-xl border-4 border-orange-50">
              <h2 className="text-3xl font-black text-slate-900 mb-4">Profile Setup Baaki Hai!</h2>
              <p className="text-slate-500 font-bold mb-8">Pehle Parent section mein jaakar profile create karein.</p>
              <button 
                onClick={() => setView("Parent")} 
                className="w-full bg-orange-500 text-white font-black py-5 rounded-3xl shadow-xl hover:bg-orange-600 transition-all text-xl"
              >
                Setup Profile Now
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
