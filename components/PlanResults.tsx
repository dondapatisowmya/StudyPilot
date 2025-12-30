
import React from 'react';
import { StudyPlanResponse } from '../types';

interface PlanResultsProps {
  plan: StudyPlanResponse;
  theme: 'light' | 'dark';
}

const PlanResults: React.FC<PlanResultsProps> = ({ plan, theme }) => {
  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'High': return theme === 'dark' ? 'bg-red-900/40 text-red-300 border-red-800/50' : 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return theme === 'dark' ? 'bg-yellow-900/40 text-yellow-300 border-yellow-800/50' : 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low': return theme === 'dark' ? 'bg-emerald-900/40 text-emerald-300 border-emerald-800/50' : 'bg-green-100 text-green-700 border-green-200';
      default: return theme === 'dark' ? 'bg-slate-800 text-emerald-400 border-slate-700' : 'bg-emerald-100 text-emerald-700';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`max-w-6xl mx-auto space-y-10 animate-fade-in pb-20 transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Summary Header */}
      <section className={`rounded-3xl shadow-sm border overflow-hidden transition-colors ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-100'}`}>
        <div className="bg-emerald-600 p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Your Study Summary</h2>
          <p className="opacity-90 leading-relaxed text-lg">{plan.summary}</p>
        </div>
        <div className={`p-8 grid grid-cols-1 md:grid-cols-2 gap-8 ${theme === 'dark' ? 'bg-slate-800/30' : 'bg-white'}`}>
          <div className="space-y-4">
            <h3 className={`text-xl font-bold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              <span className="w-2 h-8 bg-emerald-500 rounded-full mr-3 no-print"></span>
              Handling Hard Subjects
            </h3>
            <p className={`leading-relaxed italic border-l-4 border-emerald-500 pl-4 py-2 rounded-r-lg ${theme === 'dark' ? 'text-gray-400 bg-emerald-900/10' : 'text-gray-600 bg-emerald-50/30'}`}>
              "{plan.weakSubjectStrategy}"
            </p>
          </div>
          <div className="space-y-4">
             <h3 className={`text-xl font-bold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              <span className="w-2 h-8 bg-emerald-500 rounded-full mr-3 no-print"></span>
              Quick Tips
            </h3>
            <ul className="space-y-2">
              {plan.generalStudyTips.slice(0, 4).map((tip, i) => (
                <li key={i} className={`flex items-start text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className="text-emerald-500 mr-2 mt-1 no-print">✦</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Daily Template */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Your Daily Schedule</h2>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest no-print">Simple Routine</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plan.dailyScheduleTemplate.map((task, i) => (
            <div key={i} className={`p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className={`text-xs font-bold px-2 py-1 rounded ${theme === 'dark' ? 'text-emerald-400 bg-emerald-900/30' : 'text-emerald-600 bg-emerald-50'}`}>
                  {task.timeSlot}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              <div className="mb-2">
                <span className={`inline-block px-2 py-0.5 font-black text-xs rounded-md border uppercase tracking-wider ${
                  theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  {task.subject}
                </span>
              </div>
              <h4 className={`font-bold text-lg mb-1 leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{task.activity}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Milestones */}
      <section>
        <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Week by Week Goals</h2>
        <div className={`relative border-l-2 ml-4 space-y-8 py-4 ${theme === 'dark' ? 'border-slate-800' : 'border-emerald-100'}`}>
          {plan.weeklyBreakdown.map((week, i) => (
            <div key={i} className="relative pl-8">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-600 ring-4 ring-emerald-50 dark:ring-slate-900 no-print"></div>
              <div className={`p-6 rounded-2xl shadow-sm border transition-all group ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-emerald-500/50' : 'bg-white border-gray-100 hover:border-emerald-300'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                  <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Week {week.weekNumber}: <span className={`px-2 rounded-lg ${theme === 'dark' ? 'text-emerald-400 bg-emerald-900/30' : 'text-emerald-600 bg-emerald-50'}`}>{week.focusArea}</span>
                  </h3>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border mt-2 md:mt-0 ${theme === 'dark' ? 'text-emerald-400 bg-emerald-900/30 border-emerald-800' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>Test Goal: {week.mockTestGoal}</span>
                </div>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Weekly Review:</span> 
                  <span className={`ml-2 inline-block px-2 py-1 border rounded-md font-bold text-sm ${theme === 'dark' ? 'bg-emerald-900/20 text-emerald-300 border-emerald-800' : 'bg-yellow-50 text-yellow-800 border-yellow-100'}`}>
                    {week.revisionTopic}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mock Tests & Final Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className={`p-8 rounded-3xl border shadow-sm transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
          <h3 className={`text-xl font-bold mb-6 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-emerald-500 no-print" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            Practice Tests
          </h3>
          <div className="space-y-4">
            {plan.mockTestSuggestions.map((test, i) => (
              <div key={i} className={`flex items-center p-3 border rounded-xl ${theme === 'dark' ? 'bg-slate-700/50 border-slate-600' : 'bg-green-50/20 border-gray-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 ${theme === 'dark' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-green-100 text-green-600'}`}>
                  {i + 1}
                </div>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700 font-medium'}>{test}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={`p-8 rounded-3xl shadow-xl flex flex-col justify-center ${theme === 'dark' ? 'bg-emerald-900 text-white border-emerald-800' : 'bg-emerald-900 text-white border-emerald-800'}`}>
          <h3 className="text-2xl font-bold mb-4">You can do this!</h3>
          <p className="opacity-80 mb-6 leading-relaxed">
            Don't worry about being perfect. Just follow the plan step-by-step. Taking the practice tests is the best way to feel ready. Good luck!
          </p>
          <div className="flex space-x-4 no-print">
            <button 
              onClick={handlePrint} 
              className="flex-1 bg-white text-emerald-900 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg active:scale-95"
            >
              Print My Plan
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PlanResults;