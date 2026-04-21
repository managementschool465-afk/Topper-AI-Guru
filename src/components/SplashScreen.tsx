import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

/**
 * Topper AI Guru - Splash Screen Component
 * 
 * ✅ WHITE SCREEN FIX:
 * Isme ek "Defensive Backup Timer" add kiya gaya hai. 
 * Agar kisi wajah se animation transition hang ho jaye (browser issue), 
 * toh 6 seconds baad app apne aap main view ko force load kar dega.
 */
export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 1. Primary Timer: Animation finish hone ke baad close karein
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Fade out transition ke liye thoda extra time
      setTimeout(onComplete, 800); 
    }, 3500);

    // 2. Defensive Backup Timer: 
    // Agar animation code block ho jaye, toh 6 seconds baad force exit.
    const backupTimer = setTimeout(() => {
      console.warn("Splash screen backup timer triggered. Forcing application entrance.");
      onComplete();
    }, 6000);

    return () => {
      clearTimeout(timer);
      clearTimeout(backupTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-center"
          >
            {/* Displaying the App Title with Gold Glow */}
            <h1 
              className="text-6xl md:text-8xl font-black tracking-tighter mb-6 drop-shadow-[0_0_35px_rgba(255,215,0,0.5)]"
              style={{ color: '#FFD700' }}
            >
              Topper AI Guru 🏆
            </h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="text-slate-400 text-xl md:text-2xl font-bold tracking-widest uppercase"
            >
              Padho Smart, Bano Topper 🚀
            </motion.p>
          </motion.div>
          
          {/* Progress Visual Component */}
          <div className="absolute bottom-16 w-64 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 3.5, ease: "easeInOut", repeat: 0 }}
              className="w-full h-full bg-gradient-to-r from-transparent via-[#FFD700] to-transparent shadow-[0_0_10px_#FFD700]"
            />
          </div>

          <div className="absolute bottom-8 text-slate-600 font-bold text-[10px] tracking-widest uppercase">
            Initializing Learning Engine...
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
