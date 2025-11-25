import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  status: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ status }) => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm p-6 text-center animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Analyzing...</h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm">{status}</p>
      </div>
    </div>
  );
};