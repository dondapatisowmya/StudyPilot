
import React, { useState, useEffect } from 'react';
import { LoadingStep } from '../types';

interface LoadingStateProps {
  theme: 'light' | 'dark';
}

const LoadingState: React.FC<LoadingStateProps> = ({ theme }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = Object.values(LoadingStep);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in transition-colors duration-300`}>
      <div className="relative">
        <div className={`w-24 h-24 border-4 rounded-full animate-spin ${theme === 'dark' ? 'border-slate-800 border-t-emerald-500' : 'border-emerald-100 border-t-emerald-600'}`}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-10 h-10 text-emerald-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{steps[currentStep]}</h3>
        <p className={`font-medium animate-pulse ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Our Academic Engine is working hard...</p>
      </div>
      <div className={`w-64 h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}>
        <div 
          className="h-full bg-emerald-500 transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default LoadingState;
