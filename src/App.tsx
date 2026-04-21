import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";
import { StudentProfile, UserRole } from "./types";
import ParentDashboard from "./components/ParentDashboard";
import StudentDashboard from "./components/StudentDashboard";
import SplashScreen from "./components/SplashScreen";
import { motion, AnimatePresence } from "motion/react";
import { LogIn, Sparkles, Loader2, GraduationCap, Users, ShieldAlert } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 监听 Auth 状态 (Firebase Security)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch User Profile
        const profileRef = doc(db, "profiles", firebaseUser.uid);
        const unsubProfile = onSnapshot(profileRef, (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as StudentProfile);
            if (!view) setView("Student"); // Auto-switch to Student if profile exists
          } else {
            setView("Parent"); // Force Parent view for setup if no profile found
          }
          setLoading(false);
        }, (err) => {
          console.error("Firestore error:", err);
          setError("Failed to load your profile. Please check your connection.");
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
      setError("Login cancel ho gaya ya internet issue hai.");
      console.error(err);
    }
  };

  // State 1: Animation Initial (Anti-hang)
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // State 2: Background Loading
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Aapka safar shuru ho raha hai...</p>
      </div>
    );
  }

  // State 3: Auth Error OR Missing Config
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-red-50 text-center max-w-sm">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Opps! Kuch galat ho gaya</h2>
          <p className="text-slate-500 font-medium mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-red-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg">Refresh Karein</button>
        </div>
      </div>
    );
  }

  // State 4: Landing Page
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50 p-6 font-sans">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-[50px] shadow-2xl p-12 text-center border-8 border-white"
        >
          <div className="w-24 h-24 bg-indigo-gradient text-white rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-100 bouncy">
            <Sparkles className="w-12 h-12" />
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Topper AI Guru</h1>
          <p className="text-slate-500 font-bold text-lg mb-12 leading-relaxed italic">
            "Padho Smart, Bano Topper!" 🚀
          </p>
          
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-4 bg-indigo-gradient hover:scale-[1.02] text-white font-black text-xl py-6 rounded-3xl transition-all shadow-2xl shadow-indigo-200"
          >
            <LogIn className="w-6 h-6" /> Start with Google
          </button>
        </motion.div>
      </div>
    );
  }

  // State 5: Dashboard Entry
  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      {/* Navigation Bar (Desktop top, Mobile bottom) */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-white/90 backdrop-blur-lg border-2 border-slate-100 px-6 py-4 rounded-full shadow-2xl flex items-center gap-6">
        <button
          onClick={() => setView("Student")}
          className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all ${
            view === "Student" ? "bg-indigo-600 text-white shadow-xl scale-105" : "text-slate-400 hover:bg-slate-50"
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span className="font-black text-xs uppercase tracking-widest">Student Mode</span>
        </button>
        <div className="w-px h-6 bg-slate-200" />
        <button
          onClick={() => setView("Parent")}
          className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all ${
            view === "Parent" ? "bg-orange-500 text-white shadow-xl scale-105" : "text-slate-400 hover:bg-slate-50"
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="font-black text-xs uppercase tracking-widest">Parent Panel</span>
        </button>
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={view || 'init'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {view === "Parent" ? (
             <ParentDashboard profile={profile} onUpdate={() => setView("Student")} />
          ) : profile ? (
             <StudentDashboard profile={profile} />
          ) : (
            <div className="min-h-screen flex items-center justify-center p-12">
               <div className="bg-white p-12 rounded-[50px] shadow-2xl text-center max-w-sm border-4 border-orange-50">
                  <h2 className="text-3xl font-black mb-4">Setup Required!</h2>
                  <p className="text-slate-500 font-bold mb-8">Pehle Parent Dashboard mein details bhar dijiye.</p>
                  <button onClick={() => setView("Parent")} className="bg-orange-500 text-white font-black px-12 py-4 rounded-2xl">Go to Settings</button>
               </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
