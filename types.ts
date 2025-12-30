
export interface Attachment {
  mimeType: string;
  data: string; // base64
  fileName: string;
}

export interface StudyPlanParams {
  examType: string;
  examDate?: string;
  dailyHours: number;
  subjects: string[];
  weakSubjects: string[];
  attachments?: Attachment[];
  extraNotes?: string;
}

export interface DayTask {
  timeSlot: string;
  subject: string;
  activity: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface WeeklyMilestone {
  weekNumber: number;
  focusArea: string;
  revisionTopic: string;
  mockTestGoal: string;
}

export interface StudyPlanResponse {
  summary: string;
  dailyScheduleTemplate: DayTask[];
  weeklyBreakdown: WeeklyMilestone[];
  generalStudyTips: string[];
  mockTestSuggestions: string[];
  weakSubjectStrategy: string;
}

export enum LoadingStep {
  INITIAL = 'Checking your exam info...',
  READING_FILES = 'Reading your uploaded notes and photos...',
  CALCULATING = 'Working out the study hours...',
  PLANNING = 'Making your weekly goals...',
  REVISING = 'Adding extra time for hard subjects...',
  FINALIZING = 'Finishing your personalized plan...'
}