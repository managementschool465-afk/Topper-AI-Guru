import React, { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { StudentProfile } from "../types";
import { motion } from "motion/react";
import { Trophy, Medal, User } from "lucide-react";

export default function Leaderboard({ currentUserId }: { currentUserId: string }) {
  const [topStudents, setTopStudents] = useState<StudentProfile[]>([]);

  useEffect(() => {
    const q = query(collection(db, "profiles"), orderBy("points", "desc"), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTopStudents(snapshot.docs.map(doc => doc.data() as StudentProfile));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-indigo-50">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl"><Trophy className="w-6 h-6" /></div>
        <h2 className="text-2xl font-black text-slate-900">Global Leaderboard</h2>
      </div>
      <div className="space-y-4">
        {topStudents.map((student, index) => (
          <motion.div key={student.uid} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between p-4 rounded-3xl transition-all ${student.uid === currentUserId ? "bg-indigo-50 border-2 border-indigo-200" : "bg-slate-50"}`}>
            <div className="flex items-center gap-4">
              <span className="w-8 text-center font-black text-slate-400">{index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}</span>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"><User className="w-5 h-5 text-slate-300" /></div>
              <div><p className="font-black text-slate-900">{student.name}</p> <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level {student.level}</p></div>
            </div>
            <div className="text-right"><p className="text-lg font-black text-indigo-600">{student.points}</p><p className="text-[8px] font-black text-slate-400 uppercase">Points</p></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
