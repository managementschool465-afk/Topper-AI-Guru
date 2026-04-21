import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800);
    }, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black p-6">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }}>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-[#FFD700] mb-6 drop-shadow-[0_0_25px_rgba(255,215,0,0.4)]">Topper AI Guru 🏆</h1>
            <p className="text-slate-400 text-xl font-bold uppercase tracking-widest text-center">Padho Smart, Bano Topper 🚀</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
