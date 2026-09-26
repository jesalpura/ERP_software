import React from 'react';
import { Calendar, Sparkles, Loader2 } from 'lucide-react';

export default function CalendarLoader({ title = "Loading Holiday & Academic Calendar" }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] w-full p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center animate-fadeIn">
      <div className="relative flex items-center justify-center mb-6">
        {/* Pulsing ambient background glow */}
        <div className="absolute w-24 h-24 rounded-full bg-blue-500/10 dark:bg-blue-500/20 animate-ping" />
        <div className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
        
        {/* Central glowing icon container */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Calendar className="w-8 h-8 animate-bounce" />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
      </div>
      
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
        Initializing Panchangam astronomical calculations, national public holidays, state observances, and academic schedules...
      </p>

      {/* Animated gradient progress bar */}
      <div className="w-64 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative mb-4">
        <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full animate-pulse w-full" />
      </div>

      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 px-3.5 py-1.5 rounded-full">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
        <span>Loading calendar engine...</span>
      </div>
    </div>
  );
}
