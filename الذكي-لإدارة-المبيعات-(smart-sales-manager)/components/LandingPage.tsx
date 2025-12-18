
import React, { useEffect, useState } from 'react';
import { ShoppingCart, Sparkles, ShieldCheck, Zap } from 'lucide-react';

const LandingPage: React.FC<{ onFinished: () => void }> = ({ onFinished }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 5000; // 5 seconds
    const intervalTime = 50;
    const increment = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinished, 500);
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onFinished]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-tajawal">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Animated Logo Container */}
        <div className="relative mb-8 animate-bounce duration-[2000ms]">
          <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-40 rounded-full scale-150 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-indigo-500 to-indigo-700 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-900/50">
            <ShoppingCart size={80} className="text-white" strokeWidth={1.5} />
          </div>
          <div className="absolute -top-4 -right-4 bg-amber-400 p-3 rounded-2xl shadow-lg rotate-12 animate-pulse">
            <Sparkles size={24} className="text-slate-900" />
          </div>
        </div>

        {/* Title & Slogan */}
        <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
          البائع <span className="text-indigo-400">الذكي</span>
        </h1>
        <p className="text-slate-400 text-xl font-medium max-w-md leading-relaxed">
          مساعدك التقني لإدارة تجارتك بذكاء وسهولة.. <br/> 
          <span className="text-indigo-300/60 text-sm">نظام POS متكامل يعمل محلياً بالكامل</span>
        </p>

        {/* JOX Branding with Soft Neon */}
        <div className="mt-10 mb-10 flex flex-col items-center group">
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mb-4 opacity-50"></div>
          <span className="text-4xl font-black italic tracking-tighter text-indigo-400 drop-shadow-[0_0_12px_rgba(129,140,248,0.7)] font-serif animate-pulse">
            JOX
          </span>
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mt-4 opacity-50"></div>
        </div>

        {/* Progress Bar Container */}
        <div className="w-64 h-1.5 bg-slate-900 rounded-full overflow-hidden mb-4 border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(79,70,229,0.5)]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">جاري تشغيل محرك البيانات المحاسبية</p>
      </div>

      {/* Floating Elements for Aesthetics */}
      <div className="absolute bottom-10 right-10 opacity-5">
        <ShoppingCart size={200} className="text-white" />
      </div>
    </div>
  );
};

export default LandingPage;
