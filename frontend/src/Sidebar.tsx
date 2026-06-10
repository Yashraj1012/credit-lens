import React from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  LineChart, 
  Info, 
  Activity, 
  Menu, 
  X 
} from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';

export type PageId = 'dashboard' | 'assessment' | 'analytics' | 'about';

interface SidebarProps {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activePage, 
  setActivePage, 
  isOpen, 
  setIsOpen 
}) => {
  const menuItems = [
    { id: 'dashboard' as PageId, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assessment' as PageId, label: 'Risk Assessment', icon: ShieldAlert },
    { id: 'analytics' as PageId, label: 'Model Analytics', icon: LineChart },
    { id: 'about' as PageId, label: 'About Model', icon: Info },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
            <Activity className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-400 bg-clip-text text-transparent">
            CreditLens
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 focus:outline-none"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar Drawers */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:sticky md:h-screen`}
      >
        <div className="flex flex-col flex-1">
          {/* Logo Section */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 dark:bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                  CreditLens
                </span>
                <span className="text-xs text-slate-450 dark:text-slate-400 font-medium tracking-wide uppercase">
                  Risk Engine v1.0
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-550 dark:text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsOpen(false); // Close sidebar on mobile
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-950/45 text-brand-600 dark:text-brand-400 shadow-sm border border-brand-100/50 dark:border-brand-900/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                      isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">
              System Settings
            </span>
            <span className="text-[10px] text-slate-450 dark:text-slate-500">
              Toggle theme mode
            </span>
          </div>
          <ThemeToggle />
        </div>
      </aside>
      
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}
    </>
  );
};
