
import { GoogleGenAI, Type } from "@google/genai";
import { StudyPlanParams, StudyPlanResponse } from "../types.ts";

export const generateStudyPlan = async (params: StudyPlanParams): Promise<StudyPlanResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const dateInfo = params.examDate 
    ? `- Exam Date: ${params.examDate}` 
    : "- Exam Date: Not set yet (Please provide a general preparation plan for the next 6-8 weeks).";

  const textPrompt = `
    You are a friendly and helpful study coach for students. 
    
    TASK: Create a simple, clear study plan.
    LANGUAGE LEVEL: Use simple English.
    
    Student Information:
    - Exam: ${params.examType}
    ${dateInfo}
    - Daily Study Time: ${params.dailyHours} hours
    - All Subjects: ${params.subjects.join(', ')}
    - Subjects they find hard: ${params.weakSubjects.join(', ')}
    ${params.extraNotes ? `- Extra Notes from Student: "${params.extraNotes}"` : ''}

    ATTACHMENTS: The student has provided photos/PDFs of their syllabus or notes. 
    Use the information in these files to make the study plan very specific to their actual school work.
    
    The plan must focus on the subjects they find hard. Include small breaks. 
    ${params.examDate ? `Suggest clear dates for practice tests (mock tests) before ${params.examDate}.` : "Since no exam date is set, suggest mock tests at regular intervals like every 2 weeks."}
    
    Return ONLY a valid JSON object.
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

    let text = response.text;
    if (!text) throw new Error("The AI didn't return any text.");
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("I had trouble talking to the AI. Please check your connection.");
  }
};
