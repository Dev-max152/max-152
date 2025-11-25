import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Copy, Share2, Check } from 'lucide-react';
import { ScanResult } from '../types';

interface SolutionViewProps {
  data: ScanResult;
  onBack: () => void;
}

export const SolutionView: React.FC<SolutionViewProps> = ({ data, onBack }) => {
  const [copied, setCopied] = React.useState(false);

  const textToShare = `Question: ${data.transcription}\n\nExplanation:\n${data.explanation}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(textToShare);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'StudyBuddy Solution',
          text: textToShare,
        });
      } catch (error) {
        // Ignore AbortError (user cancelled)
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopy();
      alert('Sharing not supported on this device. Copied to clipboard!');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-semibold text-slate-900 dark:text-white">Solution</span>
        
        {/* Share Button */}
        <button 
            onClick={handleShare}
            className="p-2 -mr-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
            aria-label="Share solution"
        >
             <Share2 className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* Original Image Snippet */}
        <div className="rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800">
          <img src={data.imageUri} alt="Problem" className="w-full max-h-48 object-cover" />
        </div>

        {/* Transcribed Text Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Extracted Question</h3>
          <p className="text-slate-800 dark:text-slate-200 font-medium italic border-l-4 border-blue-500 pl-3 py-1">
            "{data.transcription}"
          </p>
        </div>

        {/* AI Explanation Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">Step-by-Step Explanation</h3>
            <button 
              onClick={handleCopy}
              className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
              title="Copy solution"
            >
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="markdown-body text-slate-700 dark:text-slate-300 text-sm md:text-base">
            <ReactMarkdown>{data.explanation}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};