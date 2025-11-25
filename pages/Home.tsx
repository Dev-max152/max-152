import React from 'react';
import { Camera, BookOpen, Sparkles } from 'lucide-react';

interface HomeProps {
  onScanClick: () => void;
}

export const Home: React.FC<HomeProps> = ({ onScanClick }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center bg-gradient-to-b from-blue-50 to-slate-50 dark:from-slate-900 dark:to-slate-950">
      
      <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-6">
        <BookOpen className="w-12 h-12 text-blue-600 dark:text-blue-400" />
      </div>

      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
        StudyBuddy
      </h1>
      
      <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xs mb-10 leading-relaxed">
        Stuck on a problem? Snap a photo and let AI guide you through the solution.
      </p>

      <div className="w-full max-w-xs space-y-4">
        <button
          onClick={onScanClick}
          className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 px-8 rounded-2xl shadow-xl shadow-blue-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Camera className="w-6 h-6" />
          Scan Homework
        </button>
        
        <div className="grid grid-cols-2 gap-4 mt-8">
           <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center">
              <Sparkles className="w-6 h-6 text-amber-500 mb-2" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Instant AI</span>
           </div>
           <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center">
              <BookOpen className="w-6 h-6 text-emerald-500 mb-2" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Step-by-step</span>
           </div>
        </div>
      </div>
    </div>
  );
};