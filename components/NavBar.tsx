import React from 'react';
import { Home, History, Camera } from 'lucide-react';
import { AppScreen } from '../types';

interface NavBarProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ currentScreen, onNavigate }) => {
  // Don't show nav bar on camera or editor screen to maximize view
  if (currentScreen === 'camera' || currentScreen === 'image_editor') return null;

  const getButtonClass = (screen: AppScreen) => `
    flex flex-col items-center justify-center w-full h-full py-2
    ${currentScreen === screen 
      ? 'text-blue-600 dark:text-blue-400' 
      : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}
  `;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 h-16 flex justify-around items-center z-40 pb-safe">
      <button className={getButtonClass('home')} onClick={() => onNavigate('home')}>
        <Home className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">Home</span>
      </button>
      
      <button 
        className="flex flex-col items-center justify-center -mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg shadow-blue-600/30 transition-transform active:scale-95"
        onClick={() => onNavigate('camera')}
      >
        <Camera className="w-7 h-7" />
      </button>

      <button className={getButtonClass('history')} onClick={() => onNavigate('history')}>
        <History className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">History</span>
      </button>
    </div>
  );
};