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
            setProfile(snap.data() as StudentProfile);
            if (!view) setView("Student");
          } else {
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
    await signInWithPopup(auth, provider);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50 p-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white rounded-[50px] shadow-2xl p-12 text-center border-8 border-white">
        <div className="w-24 h-24 bg-indigo-gradient text-white rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-xl bouncy"><Sparkles className="w-12 h-12" /></div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Topper AI Guru 🏆</h1>
        <p className="text-slate-500 font-bold text-lg mb-12">Padho Smart, Bano Topper 🚀</p>
        <button onClick={handleLogin} className="w-full flex items-center justify-center gap-4 bg-indigo-gradient text-white font-black text-xl py-6 rounded-3xl shadow-2xl shadow-indigo-100 transition-all"><LogIn className="w-6 h-6" /> Google Se Login Karein</button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-indigo-50 font-sans antialiased">
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md border-4 border-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-8">
        <button onClick={() => setView("Student")} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${view === "Student" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400"}`}><GraduationCap className="w-5 h-5" /><span className="font-black text-xs uppercase tracking-widest">Student</span></button>
        <button onClick={() => setView("Parent")} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${view === "Parent" ? "bg-orange-500 text-white shadow-lg" : "text-slate-400"}`}><Users className="w-5 h-5" /><span className="font-black text-xs uppercase tracking-widest">Parent</span></button>
      </nav>
      <AnimatePresence mode="wait">
        {view === "Parent" ? (
          <motion.div key="parent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ParentDashboard profile={profile} onUpdate={() => setView("Student")} /></motion.div>
        ) : profile ? (
          <motion.div key="student" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><StudentDashboard profile={profile} /></motion.div>
        ) : (
          <div className="min-h-screen flex items-center justify-center p-12 text-center">
            <div><h2 className="text-3xl font-black mb-4">Pehle Setup Karein!</h2><p className="text-slate-500 font-bold mb-8">Parent settings mein student ki details bharein.</p><button onClick={() => setView("Parent")} className="bg-orange-500 text-white font-black px-8 py-4 rounded-2xl shadow-xl">Set Up Profile</button></div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
