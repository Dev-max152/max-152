import React from 'react';
import { Trash2, ChevronRight, Clock } from 'lucide-react';
import { ScanResult } from '../types';

interface HistoryProps {
  history: ScanResult[];
  onSelect: (item: ScanResult) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export const History: React.FC<HistoryProps> = ({ history, onSelect, onDelete, onClear }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500 dark:text-slate-400">
        <Clock className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">No history yet</p>
        <p className="text-sm">Scan a homework problem to see it here.</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-950 flex flex-col">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center sticky top-0 z-20">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">History</h2>
        <button 
          onClick={() => {
            if(window.confirm('Clear all history?')) onClear();
          }}
          className="text-sm text-red-500 font-medium hover:text-red-600"
        >
          Clear All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {history.map((item) => (
          <div 
            key={item.id} 
            onClick={() => onSelect(item)}
            className="group bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-200 dark:border-slate-700 flex gap-4 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-900 overflow-hidden flex-shrink-0">
              <img src={item.imageUri} alt="scan" className="w-full h-full object-cover" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {item.transcription || "Unknown Question"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col justify-between items-end pl-2">
               <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
               <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if(window.confirm('Delete this item?')) onDelete(item.id);
                }}
                className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};