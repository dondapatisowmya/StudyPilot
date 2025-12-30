
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";

type ToolType = 'flashcards' | 'quiz' | 'summarizer' | 'predictor' | 'mnemonic' | 'conceptmap' | 'timer' | 'assistant' | 'glossary';

interface StudyToolsProps {
  theme: 'light' | 'dark';
  userSubjects?: string[];
}

const StudyTools: React.FC<StudyToolsProps> = ({ theme, userSubjects = [] }) => {
  const [activeTool, setActiveTool] = useState<ToolType>('flashcards');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Timer States
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeLeft === 0) setTimerActive(false);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timeLeft]);

  const runTool = async (overriddenInput?: string) => {
    if (activeTool === 'timer') return;
    const finalInput = overriddenInput || input;
    if (!finalInput.trim()) return;
    setLoading(true);
    setResult(null);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      let prompt = '';
      let responseMimeType = "text/plain";
      let responseSchema: any = null;

      if (activeTool === 'flashcards') {
        prompt = `Create 6 simple study flashcards for: ${finalInput}. Each has a 'front' and a 'back'. Use simple English. Return as JSON.`;
        responseMimeType = "application/json";
        responseSchema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING },
              back: { type: Type.STRING }
            },
            required: ['front', 'back']
          }
        };
      } else if (activeTool === 'quiz') {
        prompt = `Make a 5-question multiple choice quiz for a student about: ${finalInput}. Keep it simple. Return as JSON.`;
        responseMimeType = "application/json";
        responseSchema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              answer: { type: Type.STRING }
            },
            required: ['question', 'options', 'answer']
          }
        };
      } else if (activeTool === 'summarizer') {
        prompt = `Take these notes and give me the "Big Points" in easy words. Use bullet points: ${finalInput}`;
      } else if (activeTool === 'predictor') {
        prompt = `Look at this topic: "${finalInput}". Guess 4 questions that might be on the test. Tell me why they are important and what special word I should use in my answer. Return as JSON.`;
        responseMimeType = "application/json";
        responseSchema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              importance: { type: Type.STRING },
              keyTerm: { type: Type.STRING }
            },
            required: ['question', 'importance', 'keyTerm']
          }
        };
      } else if (activeTool === 'mnemonic') {
        prompt = `Give me 2 easy ways to remember this: ${finalInput}. Use funny sentences or acronyms.`;
      } else if (activeTool === 'conceptmap') {
        prompt = `Make a "Topic Tree" for ${finalInput}. Use simple text branches like ├── to show how big ideas break into smaller ones.`;
      } else if (activeTool === 'assistant') {
        prompt = `You are a helpful study buddy. Explain this simply and answer any questions the student might have: ${finalInput}`;
      } else if (activeTool === 'glossary') {
        prompt = `Look at this text and pull out 5 to 8 "Hard Words" or "Key Words". For each word, give me a very simple definition. Return as JSON.`;
        responseMimeType = "application/json";
        responseSchema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              meaning: { type: Type.STRING }
            },
            required: ['word', 'meaning']
          }
        };
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: responseSchema ? { responseMimeType, responseSchema } : {}
      });

      if (responseSchema) {
        setResult(JSON.parse(response.text || '[]'));
      } else {
        setResult(response.text);
      }
    } catch (e) {
      console.error(e);
      setResult("I couldn't do that right now. Please check your internet and try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectClick = (sub: string) => {
    setInput(sub);
    runTool(sub);
  };

  const getToolTitle = (tool: ToolType) => {
    switch(tool) {
      case 'flashcards': return 'Flashcards';
      case 'quiz': return 'Quick Quiz';
      case 'summarizer': return 'Big Points';
      case 'predictor': return 'Exam Guesser';
      case 'mnemonic': return 'Memory Tricks';
      case 'conceptmap': return 'Topic Tree';
      case 'timer': return 'Focus Clock';
      case 'assistant': return 'Ask Anything';
      case 'glossary': return 'Word List';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-80px)] animate-fade-in transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
      <div className={`border-b px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row md:items-center justify-between transition-colors ${theme === 'dark' ? 'bg-slate-800/20 border-slate-800' : 'bg-gray-50/50 border-gray-100'}`}>
        <div className="mb-3 md:mb-0">
          <h2 className={`text-lg md:text-xl font-black flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <span className="text-emerald-500 mr-2">●</span> My Study Lab
          </h2>
          <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest">Smart tools to help you learn faster</p>
        </div>
        
        <div className={`flex flex-nowrap md:flex-wrap gap-1 p-1 rounded-2xl border shadow-sm overflow-x-auto max-w-full md:max-w-2xl transition-colors scrollbar-hide ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          {(['flashcards', 'quiz', 'summarizer', 'predictor', 'mnemonic', 'conceptmap', 'timer', 'assistant', 'glossary'] as ToolType[]).map((tool) => (
            <button
              key={tool}
              onClick={() => { setActiveTool(tool); setInput(''); setResult(null); }}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTool === tool 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : theme === 'dark' ? 'text-gray-400 hover:text-emerald-400 hover:bg-slate-700/50' : 'text-gray-400 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              {getToolTitle(tool)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className={`w-full lg:w-[400px] border-b lg:border-r p-6 md:p-8 flex flex-col overflow-y-auto transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
          {activeTool === 'timer' ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 md:space-y-8">
              <div className={`text-6xl md:text-7xl font-black tabular-nums ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatTime(timeLeft)}
              </div>
              <div className="flex flex-col w-full space-y-3">
                <button 
                  onClick={() => setTimerActive(!timerActive)}
                  className={`w-full py-4 rounded-2xl font-black text-lg text-white shadow-lg transition-all ${timerActive ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                  {timerActive ? 'PAUSE CLOCK' : 'START STUDYING'}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { setTimeLeft(25 * 60); setTimerActive(false); }} className={`p-3 border rounded-xl text-[10px] font-bold uppercase transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-gray-300 hover:bg-emerald-900/30' : 'bg-gray-50 border-gray-100 hover:bg-emerald-50'}`}>25 Min</button>
                  <button onClick={() => { setTimeLeft(50 * 60); setTimerActive(false); }} className={`p-3 border rounded-xl text-[10px] font-bold uppercase transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-gray-300 hover:bg-emerald-900/30' : 'bg-gray-50 border-gray-100 hover:bg-emerald-50'}`}>50 Min</button>
                </div>
                <button onClick={() => { setTimeLeft(5 * 60); setTimerActive(false); }} className={`w-full p-3 border rounded-xl text-[10px] font-bold uppercase transition-colors ${theme === 'dark' ? 'bg-emerald-900/10 border-emerald-900/30 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>5 Min Break</button>
              </div>
              <p className="text-xs text-gray-400 text-center leading-relaxed">Study for 25 or 50 minutes, then take a short break!</p>
            </div>
          ) : (
            <>
              {userSubjects.length > 0 && !loading && (
                <div className="mb-6">
                  <label className={theme === 'dark' ? 'text-[10px] font-black uppercase text-gray-500 mb-2 block tracking-widest' : 'text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest'}>Planned Subjects</label>
                  <div className="flex flex-wrap gap-2">
                    {userSubjects.map((sub, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleSubjectClick(sub)}
                        className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase transition-all active:scale-95 ${theme === 'dark' ? 'bg-emerald-900/20 border-emerald-800 text-emerald-400 hover:bg-emerald-500 hover:text-white' : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex-1">
                <label className={`block text-[10px] font-black uppercase mb-3 md:mb-4 tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  {['summarizer', 'conceptmap', 'glossary'].includes(activeTool) ? 'Paste Your Notes' : activeTool === 'assistant' ? 'Ask a Question' : 'Topic Name'}
                </label>
                <textarea
                  className={`w-full h-[200px] lg:h-[calc(100%-100px)] p-5 md:p-6 border-2 rounded-3xl outline-none transition-all font-medium resize-none ${
                    theme === 'dark' 
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500 focus:bg-slate-800' 
                      : 'bg-gray-50/50 border-gray-100 text-gray-800 focus:border-emerald-500 focus:bg-white placeholder:text-gray-300'
                  }`}
                  placeholder={activeTool === 'summarizer' ? 'Paste notes here...' : activeTool === 'assistant' ? 'What do you want to know?' : 'What are we learning?'}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
              <button
                onClick={() => runTool()}
                disabled={loading || !input.trim()}
                className={`mt-4 md:mt-6 w-full py-4 md:py-5 rounded-3xl font-black text-lg text-white shadow-xl transition-all transform active:scale-[0.98] ${
                  loading || !input.trim() ? 'bg-gray-300 dark:bg-slate-800 cursor-not-allowed shadow-none' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                }`}
              >
                {loading ? 'WAITING...' : `SHOW ME MY ${getToolTitle(activeTool).toUpperCase()}`}
              </button>
            </>
          )}
        </div>

        <div className={`flex-1 p-6 md:p-8 lg:p-12 overflow-y-auto transition-colors ${theme === 'dark' ? 'bg-slate-800/20' : 'bg-gray-50/30'}`}>
          {activeTool === 'timer' ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto opacity-40">
              <div className={`w-20 h-20 md:w-24 md:h-24 border rounded-[2.5rem] flex items-center justify-center mb-6 md:mb-8 shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                <svg className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className={`text-xl md:text-2xl font-black mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Focus Time</h4>
              <p className="text-sm md:text-base text-gray-500 font-medium">Use the clock on the left to track your study sessions.</p>
            </div>
          ) : loading ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className={`w-12 h-12 md:w-16 md:h-16 border-4 rounded-full animate-spin ${theme === 'dark' ? 'border-emerald-900 border-t-emerald-500' : 'border-emerald-100 border-t-emerald-600'}`}></div>
              <p className="mt-4 md:mt-6 text-emerald-600 font-black tracking-widest uppercase text-xs md:text-sm animate-pulse text-center">Thinking...</p>
            </div>
          ) : result ? (
            <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
              <div className={`flex items-center justify-between border-b pb-4 transition-colors ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl md:text-2xl font-black uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your {getToolTitle(activeTool)}</h3>
                <button onClick={() => window.print()} className="text-xs font-bold text-emerald-500 hover:underline no-print">Print This</button>
              </div>

              {activeTool === 'flashcards' && Array.isArray(result) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {result.map((card, i) => (
                    <div key={i} className={`border-2 shadow-sm p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] transition-all group ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-emerald-500/50' : 'bg-white border-white hover:border-emerald-200'}`}>
                      <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">The Card</p>
                      <p className={`font-bold text-base md:text-lg mb-4 md:mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{card.front}</p>
                      <div className={`h-px mb-4 md:mb-6 ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'}`}></div>
                      <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">The Answer</p>
                      <p className={`font-medium text-sm md:text-base leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{card.back}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTool === 'glossary' && Array.isArray(result) && (
                <div className="space-y-3 md:space-y-4">
                  {result.map((item, i) => (
                    <div key={i} className={`p-4 md:p-6 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-6 transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                      <div className={`p-2 md:p-3 rounded-xl font-black text-[10px] md:text-xs min-w-full sm:min-w-[100px] text-center uppercase tracking-tight ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                        {item.word}
                      </div>
                      <p className={`font-medium text-xs md:text-sm leading-relaxed sm:pt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{item.meaning}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTool === 'predictor' && Array.isArray(result) && (
                <div className="space-y-4 md:space-y-6">
                  {result.map((item, i) => (
                    <div key={i} className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border shadow-sm transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                      <div className="flex items-center mb-4">
                        <span className={`p-1.5 md:p-2 rounded-xl mr-3 font-black text-[9px] md:text-xs uppercase ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>Likely</span>
                        <h4 className={`text-lg md:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.question}</h4>
                      </div>
                      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6 pt-4 md:pt-6 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-gray-50'}`}>
                        <div>
                          <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase mb-1">Why study this?</p>
                          <p className={`text-xs md:text-sm italic leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{item.importance}</p>
                        </div>
                        <div>
                          <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase mb-1">Key Term</p>
                          <span className={`inline-block px-3 py-1 rounded-lg font-black text-xs md:text-sm border uppercase tracking-tight ${theme === 'dark' ? 'bg-emerald-900/20 text-emerald-300 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                            {item.keyTerm}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTool === 'quiz' && Array.isArray(result) && (
                <div className="space-y-6 md:space-y-8">
                  {result.map((q, i) => (
                    <div key={i} className={`border shadow-sm p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                      <p className={`font-black text-base md:text-lg mb-4 md:mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}><span className="text-emerald-500 mr-2">Q{i+1}.</span>{q.question}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((opt: string, j: number) => (
                          <div key={j} className={`p-3 md:p-4 border rounded-2xl text-xs md:text-sm font-bold transition-colors ${theme === 'dark' ? 'bg-slate-700/50 border-slate-600 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                            {opt}
                          </div>
                        ))}
                      </div>
                      <details className="mt-6 md:mt-8">
                        <summary className="text-[9px] md:text-[10px] font-black text-emerald-500 cursor-pointer uppercase tracking-widest no-print">Show Answer</summary>
                        <div className={`mt-3 md:mt-4 p-4 rounded-2xl font-black text-xs md:text-sm border transition-colors ${theme === 'dark' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-emerald-800 border-emerald-100'}`}>
                          {q.answer}
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              )}

              {activeTool === 'conceptmap' && (
                <div className={`p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-x-auto transition-colors ${theme === 'dark' ? 'bg-black/40 border border-slate-800' : 'bg-[#1e1e1e]'}`}>
                  <pre className="text-emerald-400 font-mono text-xs md:text-sm leading-relaxed whitespace-pre font-bold">
                    {result}
                  </pre>
                </div>
              )}

              {(activeTool === 'summarizer' || activeTool === 'mnemonic' || activeTool === 'assistant') && typeof result === 'string' && (
                <div className={`shadow-sm border p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-gray-300' : 'bg-white border-gray-100 text-gray-700'}`}>
                  <div className={`prose max-w-none leading-relaxed font-medium whitespace-pre-wrap text-base md:text-lg ${theme === 'dark' ? 'prose-invert prose-emerald text-gray-300' : 'prose-emerald text-gray-700'}`}>
                    {result}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto opacity-40">
              <div className={`w-16 h-16 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center mb-6 md:mb-8 transition-colors ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}>
                <svg className="w-8 h-8 md:w-10 md:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className={`text-xl md:text-2xl font-black mb-3 md:mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Pick a Tool</h4>
              <p className="text-xs md:text-sm text-gray-500 font-medium">Choose a tool and subject to start!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyTools;
