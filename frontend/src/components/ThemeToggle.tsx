import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
      aria-label="Toggle Theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        <div
          className={`absolute transform transition-transform duration-500 ${
            theme === 'dark' ? 'translate-y-12 rotate-45' : 'translate-y-0 rotate-0'
          }`}
        >
          <Sun className="w-5 h-5 text-amber-500 fill-amber-100 dark:fill-none" />
        </div>
        <div
          className={`absolute transform transition-transform duration-500 ${
            theme === 'dark' ? 'translate-y-0 rotate-0' : '-translate-y-12 -rotate-45'
          }`}
        >
          <Moon className="w-5 h-5 text-indigo-400 fill-indigo-900/20" />
        </div>
      </div>
    </button>
  );
};
