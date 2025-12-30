
import React from 'react';

interface HeaderProps {
  onViewChange: (view: 'planner' | 'tools' | 'resources') => void;
  currentView: 'planner' | 'tools' | 'resources';
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenHelp: () => void;
}

const Header: React.FC<HeaderProps> = ({ onViewChange, currentView, theme, onToggleTheme, onOpenHelp }) => {
  return (
    <header className={`py-4 md:py-6 border-b sticky top-0 z-50 transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900/80 backdrop-blur-md border-slate-800' : 'bg-white/80 backdrop-blur-md border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onViewChange('planner')}>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg md:xl shadow-lg">
              S
            </div>
            <span className={`text-xl md:text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Study<span className="text-emerald-500">Pilot</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 md:hidden">
            <button 
              onClick={onToggleTheme}
              aria-label="Toggle Theme"
              className={`p-2 rounded-xl border transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <button 
              onClick={onOpenHelp}
              className="bg-emerald-600 text-white px-3 py-1.5 rounded-full hover:bg-emerald-700 transition-all font-bold text-xs"
            >
              Help
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 md:space-x-6">
          <nav className="flex space-x-3 md:space-x-6 text-xs md:text-sm font-bold">
            <button 
              onClick={() => onViewChange('planner')}
              className={`transition-colors py-2 px-1 border-b-2 ${currentView === 'planner' ? 'text-emerald-500 border-emerald-500' : theme === 'dark' ? 'text-gray-400 border-transparent hover:text-emerald-400' : 'text-gray-500 border-transparent hover:text-emerald-600'}`}
            >
              Planner
            </button>
            <button 
              onClick={() => onViewChange('tools')}
              className={`transition-colors py-2 px-1 border-b-2 ${currentView === 'tools' ? 'text-emerald-500 border-emerald-500' : theme === 'dark' ? 'text-gray-400 border-transparent hover:text-emerald-400' : 'text-gray-500 border-transparent hover:text-emerald-600'}`}
            >
              Tools
            </button>
            <button 
              onClick={() => onViewChange('resources')}
              className={`transition-colors py-2 px-1 border-b-2 ${currentView === 'resources' ? 'text-emerald-500 border-emerald-500' : theme === 'dark' ? 'text-gray-400 border-transparent hover:text-emerald-400' : 'text-gray-500 border-transparent hover:text-emerald-600'}`}
            >
              Resources
            </button>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={onToggleTheme}
              aria-label="Toggle Theme"
              className={`p-2 rounded-xl border transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
              title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <button 
              onClick={onOpenHelp}
              className="bg-emerald-600 text-white px-5 py-2 rounded-full hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 dark:shadow-none font-bold text-sm"
            >
              Get Help
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
