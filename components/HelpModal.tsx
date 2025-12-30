
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onNavigate: (view: 'planner' | 'tools' | 'resources') => void;
}

const EMERGENCY_TIPS = [
  "Take 3 deep breaths right now. You are doing fine.",
  "Set a timer for just 5 minutes and start one small task.",
  "Drink a glass of water and stretch your arms.",
  "If you're stuck on a topic, move to an easier one for 10 minutes.",
  "Remember: One step at a time is how you reach the finish line."
];

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, theme, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const askAssistant = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setAnswer('');
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `I am a student using the StudyPilot app. I need help with: "${query}". 
        Give me a very short, encouraging, and helpful answer (max 3 sentences).`,
      });
      setAnswer(response.text || "I'm here to help, but I couldn't find an answer right now.");
    } catch (e) {
      setAnswer("Oops, I'm having a little trouble connecting. Please try again in a second!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className={`relative w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden transition-all transform animate-in zoom-in-95 duration-200 ${
        theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-100'
      }`}>
        <div className="bg-emerald-600 p-6 flex justify-between items-center text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-xl font-black">Pilot Support Desk</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[80vh]">
          {/* AI Quick Query */}
          <div className="space-y-4">
            <p className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Quick AI Help</p>
            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Ask me anything..."
                className={`flex-1 px-4 py-3 rounded-xl border focus:ring-2 outline-none text-sm transition-all ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white focus:ring-emerald-500/50' : 'bg-gray-50 border-gray-200 text-gray-800 focus:ring-emerald-500/30'
                }`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && askAssistant()}
              />
              <button 
                onClick={askAssistant}
                disabled={loading || !query.trim()}
                className="bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50 transition-all"
              >
                {loading ? '...' : 'Ask'}
              </button>
            </div>
            {answer && (
              <div className={`p-4 rounded-xl border animate-fade-in ${theme === 'dark' ? 'bg-emerald-900/10 border-emerald-900/30 text-emerald-100' : 'bg-emerald-50 border-emerald-100 text-emerald-800'}`}>
                <p className="text-sm font-medium leading-relaxed">{answer}</p>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
             <p className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Navigation</p>
             <div className="grid grid-cols-2 gap-3">
               <button onClick={() => onNavigate('tools')} className={`p-4 rounded-2xl border flex flex-col items-center transition-all ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700 hover:border-emerald-500' : 'bg-gray-50 border-gray-100 hover:bg-emerald-50'}`}>
                 <span className="text-xl mb-1">🛠️</span>
                 <span className="text-xs font-bold uppercase tracking-tighter">Study Tools</span>
               </button>
               <button onClick={() => onNavigate('resources')} className={`p-4 rounded-2xl border flex flex-col items-center transition-all ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700 hover:border-emerald-500' : 'bg-gray-50 border-gray-100 hover:bg-emerald-50'}`}>
                 <span className="text-xl mb-1">📚</span>
                 <span className="text-xs font-bold uppercase tracking-tighter">Resources</span>
               </button>
             </div>
          </div>

          {/* Tips */}
          <div className="space-y-4">
            <p className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Emergency Study Tips</p>
            <div className={`p-6 rounded-3xl space-y-3 transition-colors ${theme === 'dark' ? 'bg-slate-900/50 border border-slate-700' : 'bg-emerald-50/30 border border-emerald-100'}`}>
              {EMERGENCY_TIPS.map((tip, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <span className="text-emerald-500 mt-1">✦</span>
                  <p className={`text-xs font-medium leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`p-6 border-t text-center ${theme === 'dark' ? 'border-slate-700 bg-slate-900/30' : 'border-gray-100 bg-gray-50/30'}`}>
          <p className="text-[10px] text-gray-400 font-bold uppercase">Safe travels, Study Pilot!</p>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
