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

/**
 * Topper AI Guru - Main Application Component
 * 
 * Yeh component authentication, user profile loading, aur Dashboard views 
 * (Student vs Parent) ko manage karta hai.
 */
export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<UserRole | null>(null);

  useEffect(() => {
    // Firebase Auth Listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // Agar user login hai, toh uska profile Firestore se fetch karein
        const profileRef = doc(db, "profiles", user.uid);
        const unsubProfile = onSnapshot(profileRef, (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as StudentProfile);
            // Default view: Student (agar pehle se view set nahi hai)
            if (!view) setView("Student");
          } else {
            // Agar profile nahi hai, toh Parent view par bhejein setup ke liye
            setView("Parent");
          }
          setLoading(false);
        }, (error) => {
          console.error("Profile fetch error:", error);
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

  // Handle Google Login
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // 1. Splash Screen (Har baar refresh par dikhega)
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // 2. Loading State (Auth aur Profile fetch ke doraan)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // 3. Login Screen (Agar user login nahi hai)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50 p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="max-w-md w-full bg-white rounded-[50px] shadow-2xl p-12 text-center border-8 border-white"
        >
          <div className="w-24 h-24 bg-indigo-gradient text-white rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-100 bouncy">
            <Sparkles className="w-12 h-12" />
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Topper AI Guru 🏆</h1>
          <p className="text-slate-500 font-bold text-lg mb-12">Padho Smart, Bano Topper 🚀</p>
          
          <button 
            onClick={handleLogin} 
            className="w-full flex items-center justify-center gap-4 bg-indigo-gradient text-white font-black text-xl py-6 rounded-3xl shadow-2xl shadow-indigo-100 hover:opacity-90 transition-all outline-none"
          >
            <LogIn className="w-6 h-6" /> Google Se Login Karein
          </button>
        </motion.div>
      </div>
    );
  }

  // 4. Main App Layout (Authenticated Users)
  return (
    <div className="min-h-screen bg-indigo-50 font-sans antialiased pb-32">
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-white/80 backdrop-blur-md border-4 border-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-8">
        <button 
          onClick={() => setView("Student")} 
          className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all ${
            view === "Student" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span className="font-black text-[10px] uppercase tracking-widest">Student</span>
        </button>
        
        <button 
          onClick={() => setView("Parent")} 
          className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all ${
            view === "Parent" ? "bg-orange-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="font-black text-[10px] uppercase tracking-widest">Parent</span>
        </button>
      </nav>

      {/* Main Content Area with View Switching */}
      <main className="container mx-auto">
        <AnimatePresence mode="wait">
          {view === "Parent" ? (
            <motion.div 
              key="parent" 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }}
            >
              <ParentDashboard profile={profile} onUpdate={() => setView("Student")} />
            </motion.div>
          ) : profile ? (
            <motion.div 
              key="student" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
            >
              <StudentDashboard profile={profile} />
            </motion.div>
          ) : (
            // No profile yet state
            <div className="min-h-screen flex items-center justify-center p-12 text-center">
              <div className="bg-white p-12 rounded-[50px] shadow-xl border-4 border-white">
                <h2 className="text-3xl font-black mb-4">Pehle Setup Karein! ⚙️</h2>
                <p className="text-slate-500 font-bold mb-8">Parent section mein jaakar student ki details submit karein.</p>
                <button 
                  onClick={() => setView("Parent")} 
                  className="bg-orange-500 text-white font-black px-12 py-5 rounded-3xl shadow-xl hover:bg-orange-600 transition-all text-xl"
                >
                  Setup Profile Now
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
