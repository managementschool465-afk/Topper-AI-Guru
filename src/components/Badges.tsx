import React from "react";
import { motion } from "motion/react";
import { Star, Award, Zap, Book, Target, Flame } from "lucide-react";

export default function Badges({ badges }: { badges: string[] }) {
  const badgeIcons: Record<string, any> = {
    "Early Bird": <Star className="w-8 h-8 text-amber-500" />,
    "Science Wizard": <Zap className="w-8 h-8 text-indigo-500" />,
    "Maths King": <Award className="w-8 h-8 text-orange-500" />,
    "Bookworm": <Book className="w-8 h-8 text-green-500" />,
    "Streak Master": <Flame className="w-8 h-8 text-red-500" />,
  };

  return (
    <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-indigo-50">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><Award className="w-6 h-6" /></div>
        <h2 className="text-2xl font-black text-slate-900">My Badges</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {badges.map((badge, i) => (
          <motion.div key={badge} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center justify-center p-6 rounded-3xl border-4 border-slate-50 bg-slate-50 transition-all hover:scale-105">
            <div className="mb-4">{badgeIcons[badge] || <Star className="w-8 h-8 text-slate-400" />}</div>
            <p className="font-black text-[10px] text-center uppercase tracking-widest">{badge}</p>
          </motion.div>
        ))}
        {badges.length === 0 && <div className="col-span-full text-center py-8 text-slate-400 font-bold">Padhna shuru karein badges jeetne ke liye! 🚀</div>}
      </div>
    </div>
  );
}
