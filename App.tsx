import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import PlanForm from './components/PlanForm';
import PlanResults from './components/PlanResults';
import LoadingState from './components/LoadingState';
import StudyTools from './components/StudyTools';
import Resources from './components/Resources';
import HelpModal from './components/HelpModal';
import { StudyPlanParams, StudyPlanResponse } from './types';
import { generateStudyPlan } from './services/geminiService';

type View = 'planner' | 'tools' | 'resources';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('planner');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlanResponse | null>(null);
  const [activeSubjects, setActiveSubjects] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('light');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleGeneratePlan = useCallback(async (params: StudyPlanParams) => {
    setLoading(true);
    setError(null);
    setActiveSubjects(params.subjects);
    try {
      const result = await generateStudyPlan(params);
      setPlan(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'I had trouble making your plan. Please check your internet and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPlan = () => {
    setPlan(null);
    setError(null);
    setCurrentView('planner');
  };

  const openHelp = () => setIsHelpOpen(true);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'}`}>
      <Header 
        onViewChange={setCurrentView} 
        currentView={currentView} 
        theme={theme} 
        onToggleTheme={toggleTheme}
        onOpenHelp={openHelp}
      />
      
      <main className={`flex-1 ${currentView === 'planner' ? 'container mx-auto px-4 py-8 max-w-7xl' : 'w-full'}`}>
        {currentView === 'planner' ? (
          <>
            {!plan && !loading && (
              <div className="space-y-12 py-10">
                <div className="text-center space-y-4 max-w-3xl mx-auto px-4">
                  <h1 className={`text-4xl md:text-6xl font-extrabold tracking-tight leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Master Your Exams with <span className="text-emerald-500">AI Help</span>
                  </h1>
                  <p className={`text-lg md:text-xl font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your personal academic pilot. Tell us what you're studying, and we'll create the perfect flight plan.
                  </p>
                </div>
                
                <PlanForm 
                  onSubmit={handleGeneratePlan} 
                  isLoading={loading} 
                  theme={theme} 
                  onSubjectsChange={setActiveSubjects}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto px-4 no-print">
                  {[
                    { title: 'Personal Plan', desc: 'A schedule made just for your time and your subjects.', icon: '⚡' },
                    { title: 'Review Time', desc: 'Built-in time to look over things you already learned.', icon: '🧠' },
                    { title: 'Goals', desc: 'Weekly targets to help you stay on track.', icon: '🎯' }
                  ].map((feature, idx) => (
                    <div key={idx} className={`p-6 rounded-2xl border transition-all text-center ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white shadow-xl shadow-black/20' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'}`}>
                      <div className="text-3xl mb-4">{feature.icon}</div>
                      <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                      <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading && <LoadingState theme={theme} />}

            {error && (
              <div className={`max-w-2xl mx-auto mt-10 p-8 border rounded-3xl ${theme === 'dark' ? 'bg-red-900/20 border-red-800 text-red-100 shadow-2xl' : 'bg-red-50 border-red-200 text-red-800 shadow-lg'}`}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-red-500 text-white p-2 rounded-xl">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">System Message</h3>
                </div>
                <p className="mb-6 font-medium leading-relaxed">{error}</p>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setLoading(false)} 
                    className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
                  >
                    Try Again
                  </button>
                  <button 
                    onClick={resetPlan} 
                    className={`px-8 py-3 rounded-2xl font-black border transition-all ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-red-200 hover:bg-red-100'}`}
                  >
                    Start Over
                  </button>
                </div>
              </div>
            )}

            {plan && !loading && (
              <div className="py-8 px-4">
                <div className="flex justify-between items-center mb-10 no-print">
                  <button 
                    onClick={resetPlan}
                    className="flex items-center text-emerald-500 font-bold hover:text-emerald-400 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Make a New Plan
                  </button>
                  <div className="flex space-x-2">
                     <span className={`hidden sm:inline px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : 'bg-green-100 text-green-700 border-green-200'}`}>Plan Ready!</span>
                  </div>
                </div>
                <PlanResults plan={plan} theme={theme} />
              </div>
            )}
          </>
        ) : currentView === 'tools' ? (
          <StudyTools theme={theme} userSubjects={activeSubjects} />
        ) : (
          <Resources theme={theme} userSubjects={activeSubjects} />
        )}
      </main>

      {currentView === 'planner' && (
        <footer className={`border-t py-10 mt-auto transition-colors duration-300 no-print ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-gray-500' : 'bg-white border-gray-100 text-gray-400'}`}>
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm font-bold tracking-tight">STUDY<span className="text-emerald-500">PILOT</span> © 2024 • YOUR ACADEMIC WINGMAN</p>
          </div>
        </footer>
      )}

      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
        theme={theme}
        onNavigate={(view) => {
          setCurrentView(view);
          setIsHelpOpen(false);
        }}
      />
    </div>
  );
};

export default App;