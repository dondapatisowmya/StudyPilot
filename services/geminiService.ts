import { GoogleGenAI, Type } from "@google/genai";
import { StudyPlanParams, StudyPlanResponse } from "../types";

export const generateStudyPlan = async (params: StudyPlanParams): Promise<StudyPlanResponse> => {
  // Use gemini-3-flash-preview for standard text reasoning tasks like study planning.
  // It is fast and reliable for complex JSON outputs.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const dateInfo = params.examDate 
    ? `- Exam Date: ${params.examDate}` 
    : "- Exam Date: Not set yet (Please provide a general preparation plan for the next 6-8 weeks).";

  const textPrompt = `
    You are a friendly and professional academic mentor. 
    
    TASK: Create a personalized, actionable study plan.
    
    Student Details:
    - Exam: ${params.examType}
    ${dateInfo}
    - Availability: ${params.dailyHours} hours per day
    - Subjects to cover: ${params.subjects.join(', ')}
    - Areas needing extra focus: ${params.weakSubjects.join(', ')}
    ${params.extraNotes ? `- Specific Constraints/Goals: "${params.extraNotes}"` : ''}

    ${params.attachments && params.attachments.length > 0 ? "I have attached specific syllabus or notes. Use the content of these files to ensure the topics mentioned in the plan are accurate to my specific curriculum." : ""}
    
    The plan must prioritize the weak subjects. Include structured breaks and active recall sessions.
    
    Return ONLY a valid JSON object matching the requested schema.
  `;

  const parts: any[] = [{ text: textPrompt }];

  if (params.attachments && params.attachments.length > 0) {
    params.attachments.forEach(att => {
      parts.push({
        inlineData: {
          mimeType: att.mimeType,
          data: att.data
        }
      });
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            dailyScheduleTemplate: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeSlot: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  activity: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
                },
                required: ['timeSlot', 'subject', 'activity', 'priority']
              }
            },
            weeklyBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  weekNumber: { type: Type.INTEGER },
                  focusArea: { type: Type.STRING },
                  revisionTopic: { type: Type.STRING },
                  mockTestGoal: { type: Type.STRING }
                },
                required: ['weekNumber', 'focusArea', 'revisionTopic', 'mockTestGoal']
              }
            },
            generalStudyTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            mockTestSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            weakSubjectStrategy: { type: Type.STRING }
          },
          required: ['summary', 'dailyScheduleTemplate', 'weeklyBreakdown', 'generalStudyTips', 'mockTestSuggestions', 'weakSubjectStrategy']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text from AI.");
    
    return JSON.parse(text.trim());
  } catch (error: any) {
    console.error("Gemini API Error Detail:", error);
    if (error.message?.includes('403') || error.message?.includes('401')) {
      throw new Error("Invalid API Key. Please check your deployment environment variables.");
    }
    throw new Error("Our study engine encountered an issue. Please try again in a few moments.");
  }
};