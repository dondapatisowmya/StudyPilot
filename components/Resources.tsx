
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface ResourceLink {
  uri: string;
  title: string;
}

interface ResourcesProps {
  theme: 'light' | 'dark';
  userSubjects?: string[];
}

const Resources: React.FC<ResourcesProps> = ({ theme, userSubjects = [] }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<ResourceLink[]>([]);
  const [summary, setSummary] = useState('');

  const findResources = async (overriddenQuery?: string) => {
    const finalQuery = overriddenQuery || query;
    if (!finalQuery.trim()) return;
    setLoading(true);
    setResources([]);
    setSummary('');

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Find high-quality, free educational resources (websites, videos, articles) for studying: ${finalQuery}. 
        Briefly explain why these are good. Include specific sites like Khan Academy, Coursera, or YouTube channels if relevant.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      setSummary(response.text || '');
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const links: ResourceLink[] = chunks
          .filter((chunk: any) => chunk.web)
          .map((chunk: any) => ({
            uri: chunk.web.uri,
            title: chunk.web.title || 'Educational Resource',
          }));
        setResources(links);
      }
    } catch (error) {
      console.error("Error finding resources:", error);
      setSummary("I couldn't find resources right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (sub: string) => {
    setQuery(sub);
    findResources(sub);
  };

  return (
    <div className={`min-h-[calc(100vh-80px)] p-6 md:p-12 transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50/30'}`}>
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-4">
          <h2 className={`text-3xl md:text-5xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Resource <span className="text-emerald-500">Finder</span>
          </h2>
          <p className={`text-sm md:text-base font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            The best materials for your exam, verified by AI.
          </p>
        </div>

        <div className={`p-6 md:p-8 rounded-[2.5rem] border shadow-xl transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="What are you studying today?"
              className={`flex-1 px-6 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${
                theme === 'dark' 
                  ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500' 
                  : 'bg-gray-50 border-gray-100 text-gray-800 focus:border-emerald-500'
              }`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && findResources()}
            />
            <button
              onClick={() => findResources()}
              disabled={loading || !query.trim()}
              className={`px-8 py-4 rounded-2xl font-black text-white shadow-lg transition-all transform active:scale-95 ${
                loading || !query.trim() ? 'bg-gray-300 dark:bg-slate-800' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {loading ? 'SEARCHING...' : 'FIND RESOURCES'}
            </button>
          </div>

          {userSubjects.length > 0 && (
            <div className="pt-4 border-t border-dashed border-gray-200 dark:border-slate-700">
              <label className={theme === 'dark' ? 'text-[10px] font-black uppercase text-gray-500 mb-3 block tracking-widest' : 'text-[10px] font-black uppercase text-gray-400 mb-3 block tracking-widest'}>Recommended for your plan</label>
              <div className="flex flex-wrap gap-2">
                {userSubjects.map((sub, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleQuickSearch(sub)}
                    className={`px-4 py-2 rounded-xl border text-xs font-black uppercase transition-all active:scale-95 ${theme === 'dark' ? 'bg-emerald-900/20 border-emerald-800 text-emerald-400 hover:bg-emerald-500 hover:text-white' : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className={`w-12 h-12 border-4 rounded-full animate-spin ${theme === 'dark' ? 'border-emerald-900 border-t-emerald-500' : 'border-emerald-100 border-t-emerald-600'}`}></div>
            <p className="mt-4 text-emerald-500 font-black tracking-widest text-xs animate-pulse">Scanning the Web...</p>
          </div>
        )}

        {summary && !loading && (
          <div className="space-y-8 animate-fade-in">
            <div className={`p-8 md:p-10 rounded-[2.5rem] border shadow-sm transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-xl font-black mb-6 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <span className="w-2 h-8 bg-emerald-500 rounded-full mr-3 no-print"></span>
                Curated Advice
              </h3>
              <div className={`prose max-w-none leading-relaxed font-medium whitespace-pre-wrap ${theme === 'dark' ? 'prose-invert text-gray-300' : 'text-gray-600'}`}>
                {summary}
              </div>
            </div>

            {resources.length > 0 && (
              <div className="space-y-6">
                <h3 className={`text-xl font-black flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <span className="w-2 h-8 bg-emerald-500 rounded-full mr-3 no-print"></span>
                  Quick Links
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map((link, i) => (
                    <a
                      key={i}
                      href={link.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-6 rounded-2xl border flex items-center group transition-all transform hover:-translate-y-1 ${
                        theme === 'dark' 
                          ? 'bg-slate-800 border-slate-700 hover:border-emerald-500/50' 
                          : 'bg-white border-gray-100 hover:border-emerald-200 shadow-sm'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-colors ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className={`font-black text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{link.title}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase truncate">{new URL(link.uri).hostname}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!summary && !loading && (
          <div className="py-20 flex flex-col items-center justify-center opacity-30 text-center">
            <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center mb-6 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}>
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h4 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Ready to explore?</h4>
            <p className="text-sm font-medium text-gray-500">Search for subjects to find resources.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
