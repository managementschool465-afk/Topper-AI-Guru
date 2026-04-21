import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { StudentProfile, UserRole } from "./types";
import ParentDashboard from "./components/ParentDashboard";
import StudentDashboard from "./components/StudentDashboard";
import SplashScreen from "./components/SplashScreen";
import { motion, AnimatePresence } from "motion/react";
import { LogIn, Sparkles, User, Settings, Loader2, GraduationCap, Users } from "lucide-react";

/**
 * Topper AI Guru - Main Application Component
 * 
 * Yeh component authentication state, user profile loading, aur 
 * views switcher (Student vs Parent) ko manage karta hai.
 */
export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<UserRole | null>(null);

  useEffect(() => {
    // Firebase Auth State Listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // Agar user login hai, toh uska profile fetch karein
        const profileRef = doc(db, "profiles", user.uid);
        const unsubProfile = onSnapshot(profileRef, (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as StudentProfile);
            // Default view: Student
            if (!view) setView("Student");
          } else {
            // Profile setup ke liye Parent Dashboard par bhejte hain
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

  // 1. Splash Screen View
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // 2. Loading View
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // 3. Login View (Unauthenticated)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50 p-6 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[50px] shadow-2xl p-12 text-center border-8 border-white"
        >
          <div className="w-24 h-24 bg-indigo-gradient text-white rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-100 bouncy">
            <Sparkles className="w-12 h-12" />
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Topper AI Guru 🏆</h1>
          <p className="text-slate-500 font-bold text-lg mb-12 leading-relaxed">
            Padho Smart, Bano Topper 🚀 Aapka personal AI teacher jo aapko har din kuch naya sikhayega!
          </p>
          
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-4 bg-indigo-gradient hover:opacity-90 text-white font-black text-xl py-6 rounded-3xl transition-all shadow-2xl shadow-indigo-100"
          >
            <LogIn className="w-6 h-6" /> Chalo Shuru Karein!
          </button>
        </motion.div>
      </div>
    );
  }

  // 4. Main App View (Authenticated)
  return (
    <div className="min-h-screen bg-indigo-50 font-sans antialiased pb-24">
      {/* Platform Navigation */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md border-4 border-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-8">
        <button
          onClick={() => setView("Student")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            view === "Student" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span className="font-black text-sm uppercase tracking-widest">Student</span>
        </button>
        <button
          onClick={() => setView("Parent")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            view === "Parent" ? "bg-orange-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="font-black text-sm uppercase tracking-widest">Parent</span>
        </button>
      </nav>

      {/* Dynamic Content Rendering */}
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
          <div className="min-h-screen flex items-center justify-center p-12 text-center">
            <div className="bg-white p-12 rounded-[50px] shadow-xl border-4 border-white">
              <h2 className="text-3xl font-black text-slate-900 mb-4">Pehle Setup Karein! ⚙️</h2>
              <p className="text-slate-500 font-bold mb-8 leading-relaxed">
                Parent view mein jaakar student ki details submit karein aur AI ko configure karein.
              </p>
              <button
                onClick={() => setView("Parent")}
                className="bg-orange-500 text-white font-black px-12 py-5 rounded-3xl shadow-xl hover:bg-orange-600 transition-all text-xl"
              >
                Setup Student Profile
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
                }
