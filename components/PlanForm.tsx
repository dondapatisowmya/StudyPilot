
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { StudyPlanParams, Attachment } from '../types';

interface PlanFormProps {
  onSubmit: (params: StudyPlanParams) => void;
  isLoading: boolean;
  theme: 'light' | 'dark';
  onSubjectsChange?: (subjects: string[]) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 15MB total (base64 will grow this to ~20MB)

const PlanForm: React.FC<PlanFormProps> = ({ onSubmit, isLoading, theme, onSubjectsChange }) => {
  const [formData, setFormData] = useState<StudyPlanParams>({
    examType: '',
    examDate: '',
    dailyHours: 4,
    subjects: [],
    weakSubjects: [],
    attachments: [],
    extraNotes: ''
  });

  const [currentSubject, setCurrentSubject] = useState('');
  const [currentWeakSubject, setCurrentWeakSubject] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const subjectInputRef = useRef<HTMLDivElement>(null);
  const weakInputRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notify parent of subject changes for cross-app integration
  useEffect(() => {
    onSubjectsChange?.(formData.subjects);
  }, [formData.subjects, onSubjectsChange]);

  const totalSize = useMemo(() => {
    return (formData.attachments || []).reduce((acc, curr) => {
      return acc + (curr.data.length * 0.75);
    }, 0);
  }, [formData.attachments]);

  const handleAddSubject = (subjectName?: string) => {
    const name = (subjectName || currentSubject).trim();
    if (name) {
      if (!formData.subjects.includes(name)) {
        setFormData(prev => ({ ...prev, subjects: [...prev.subjects, name] }));
      }
      setCurrentSubject('');
    }
  };

  const handleAddWeakSubject = (subjectName?: string) => {
    const name = (subjectName || currentWeakSubject).trim();
    if (name) {
      if (!formData.weakSubjects.includes(name)) {
        setFormData(prev => ({ ...prev, weakSubjects: [...prev.weakSubjects, name] }));
      }
      setCurrentWeakSubject('');
    }
  };

  const handleRemoveSubject = (index: number) => {
    setFormData(prev => ({ ...prev, subjects: prev.subjects.filter((_, i) => i !== index) }));
  };

  const handleRemoveWeakSubject = (index: number) => {
    setFormData(prev => ({ ...prev, weakSubjects: prev.weakSubjects.filter((_, i) => i !== index) }));
  };

  const processFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploadError(null);
    const newAttachments: Attachment[] = [];
    let currentSessionSize = totalSize;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`"${file.name}" is too large (max 5MB).`);
        continue;
      }
      if (currentSessionSize + file.size > MAX_TOTAL_SIZE) {
        setUploadError("Total upload limit reached (15MB). Remove some files to add more.");
        break;
      }
      const base64 = await fileToBase64(file);
      newAttachments.push({
        mimeType: file.type,
        data: base64.split(',')[1],
        fileName: file.name
      });
      currentSessionSize += file.size;
    }
    setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), ...newAttachments] }));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index)
    }));
    setUploadError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onSubmit(formData);
    }
  };

  const isFormValid = formData.examType.trim() !== '' && formData.subjects.length > 0;

  const inputBaseClasses = `px-5 py-3 border rounded-2xl focus:ring-4 outline-none transition-all font-medium`;
  const themeInputClasses = theme === 'dark' 
    ? 'bg-slate-800 border-slate-700 text-white focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-gray-600' 
    : 'bg-gray-50 border-gray-200 text-gray-800 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white placeholder:text-gray-400';

  const labelClasses = `block text-[10px] font-black uppercase mb-2 tracking-widest ${
    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
  }`;

  return (
    <div className={`rounded-3xl shadow-2xl p-6 md:p-8 border max-w-2xl mx-auto relative overflow-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-emerald-50'
    }`}>
      <h2 className={`text-2xl md:text-3xl font-extrabold mb-8 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        <div className="bg-emerald-600/10 p-2 rounded-xl mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-7 md:w-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        Study Profile
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label className={labelClasses}>Exam Name</label>
            <input
              type="text"
              placeholder="e.g. Finals, SAT"
              className={`w-full ${inputBaseClasses} ${themeInputClasses}`}
              value={formData.examType}
              onChange={(e) => setFormData(prev => ({ ...prev, examType: e.target.value }))}
              required
            />
          </div>
          <div className="group">
            <label className={labelClasses}>Exam Date (Optional)</label>
            <input
              type="date"
              className={`w-full ${inputBaseClasses} ${themeInputClasses}`}
              value={formData.examDate}
              onChange={(e) => setFormData(prev => ({ ...prev, examDate: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className={labelClasses}>Study Material (Syllabus, Notes, PDFs)</label>
            <span className={`text-[9px] font-bold uppercase mb-2 ${totalSize > MAX_TOTAL_SIZE * 0.8 ? 'text-red-500' : 'text-gray-400'}`}>
              {(totalSize / (1024 * 1024)).toFixed(1)}MB / 15MB
            </span>
          </div>
          
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); processFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-[2rem] p-6 md:p-8 text-center cursor-pointer transition-all relative ${
              isDragging 
                ? 'border-emerald-500 bg-emerald-500/10' 
                : theme === 'dark' ? 'border-slate-700 hover:border-emerald-500 hover:bg-emerald-500/5' : 'border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              accept="image/*,application/pdf"
              onChange={(e) => processFiles(e.target.files)} 
            />
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center mb-4 ${isDragging ? 'bg-emerald-500 text-white' : theme === 'dark' ? 'bg-slate-700 text-emerald-400' : 'bg-gray-50 text-emerald-600'}`}>
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <p className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>Drop your large PDF or Photos</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase mt-1">AI reads your files to plan better</p>
            </div>
          </div>
          
          {uploadError && (
            <p className="text-red-500 text-[10px] font-black uppercase px-2 animate-bounce">
              {uploadError}
            </p>
          )}

          {formData.attachments && formData.attachments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {formData.attachments.map((file, i) => (
                <div key={i} className={`relative group p-3 rounded-2xl border flex items-center space-x-3 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100 shadow-sm'}`}>
                  <div className="flex-shrink-0">
                    {file.mimeType.startsWith('image/') ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 ring-2 ring-emerald-500/20">
                        <img src={`data:${file.mimeType};base64,${file.data}`} alt="preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ring-2 ring-emerald-500/20 ${theme === 'dark' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[10px] font-black truncate uppercase tracking-tight ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{file.fileName}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Ready for AI processing</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); removeAttachment(i); }}
                    className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-red-900/40 text-gray-500 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <label className={`${labelClasses} flex items-center`}>
            <svg className="w-4 h-4 mr-1 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            Special Instructions
          </label>
          <textarea
            placeholder="Tell your coach about your schedule or specific goals..."
            className={`w-full ${inputBaseClasses} ${themeInputClasses} h-24 py-4 resize-none`}
            value={formData.extraNotes}
            onChange={(e) => setFormData(prev => ({ ...prev, extraNotes: e.target.value }))}
          />
        </div>

        <div className={`p-4 md:p-6 rounded-[2rem] border transition-colors ${theme === 'dark' ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <label className={`block text-[10px] font-black uppercase mb-4 flex justify-between ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-800'}`}>
            Daily Study Time <span>{formData.dailyHours} hours</span>
          </label>
          <input
            type="range"
            min="1"
            max="12"
            step="0.5"
            className={`w-full h-3 rounded-full appearance-none cursor-pointer accent-emerald-500 ${theme === 'dark' ? 'bg-slate-700' : 'bg-emerald-200'}`}
            value={formData.dailyHours}
            onChange={(e) => setFormData(prev => ({ ...prev, dailyHours: parseFloat(e.target.value) }))}
          />
          <div className="flex justify-between mt-2 px-1">
            <span className="text-[9px] font-bold text-emerald-500/60 uppercase">Chill Mode</span>
            <span className="text-[9px] font-bold text-emerald-500/60 uppercase">Intense Mode</span>
          </div>
        </div>

        <div className="relative" ref={subjectInputRef}>
          <label className={labelClasses}>All Subjects</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add your subjects..."
              className={`flex-1 min-w-0 ${inputBaseClasses} ${themeInputClasses}`}
              value={currentSubject}
              onChange={(e) => setCurrentSubject(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
            />
            <button 
              type="button" 
              onClick={() => handleAddSubject()} 
              className="bg-emerald-600 text-white px-5 md:px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 whitespace-nowrap text-sm md:text-base"
            >
              Add
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {formData.subjects.map((s, i) => (
              <span key={i} className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase flex items-center border transition-colors ${
                theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
              }`}>
                {s}
                <button type="button" onClick={() => handleRemoveSubject(i)} className="ml-2 opacity-50 hover:opacity-100 text-sm leading-none">×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="relative" ref={weakInputRef}>
          <label className={labelClasses}>Hard Subjects (Extra Focus Needed)</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Which ones are difficult?"
              className={`flex-1 min-w-0 ${inputBaseClasses} ${themeInputClasses}`}
              value={currentWeakSubject}
              onChange={(e) => setCurrentWeakSubject(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddWeakSubject())}
            />
            <button 
              type="button" 
              onClick={() => handleAddWeakSubject()} 
              className="bg-emerald-600 text-white px-5 md:px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 whitespace-nowrap text-sm md:text-base"
            >
              Add
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {formData.weakSubjects.map((s, i) => (
              <span key={i} className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase flex items-center border transition-colors ${
                theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
              }`}>
                {s}
                <button type="button" onClick={() => handleRemoveWeakSubject(i)} className="ml-2 opacity-50 hover:opacity-100 text-sm leading-none">×</button>
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className={`w-full py-5 rounded-[2rem] font-black text-lg text-white shadow-xl transition-all transform active:scale-[0.98] ${
            isLoading || !isFormValid ? 'bg-gray-200 cursor-not-allowed dark:bg-slate-700 text-gray-400' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
          }`}
        >
          {isLoading ? 'PREPARING YOUR PILOT...' : 'GENERATE STUDY PLAN'}
        </button>
      </form>
    </div>
  );
};

export default PlanForm;
