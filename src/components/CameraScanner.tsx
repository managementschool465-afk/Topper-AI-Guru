import React, { useRef, useState } from "react";
import { Camera, X, RefreshCcw, Sparkles, Loader2 } from "lucide-react";
import { analyzeImage } from "../services/geminiService";

export default function CameraScanner({ onClose, onResult }: { onClose: () => void, onResult: (res: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const capture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current!.videoWidth;
    canvas.height = videoRef.current!.videoHeight;
    canvas.getContext("2d")!.drawImage(videoRef.current!, 0, 0);
    setImage(canvas.toDataURL("image/jpeg"));
  };

  const analyze = async () => {
    setLoading(true);
    const res = await analyzeImage(image!.split(",")[1], "image/jpeg", "Explain this for a student.");
    onResult(res);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center p-4">
      <button onClick={onClose} className="absolute top-6 right-6 text-white"><X className="w-8 h-8" /></button>
      <div className="w-full max-w-md aspect-[3/4] bg-slate-900 rounded-[40px] overflow-hidden border-4 border-white/20">
        {!image ? <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" /> : <img src={image} className="w-full h-full object-cover" />}
        {loading && <div className="absolute inset-0 bg-indigo-900/60 flex flex-col items-center justify-center"><Loader2 className="w-16 h-16 animate-spin text-white mb-4" /><p className="text-white font-black">AI Analyzing...</p></div>}
      </div>
      <div className="mt-8 w-full max-w-md flex gap-4">
        {!image ? <button onClick={capture} className="w-full bg-white h-20 rounded-full flex items-center justify-center"><div className="w-14 h-14 bg-indigo-600 rounded-full" /></button> : (
            <><button onClick={() => setImage(null)} className="flex-1 bg-white/10 text-white py-5 rounded-3xl"><RefreshCcw className="mx-auto" /></button>
            <button onClick={analyze} className="flex-[2] bg-indigo-gradient text-white py-5 rounded-3xl font-black">Analyze with AI ✨</button></>
        )}
      </div>
    </div>
  );
}
