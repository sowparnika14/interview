export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  level: string;
  targetCompany?: string;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  password?: string;
  avatarColor: string;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  category: string;
  hint: string;
  criteria: string;
  sampleFollowUp?: string;
}

export interface AnswerBreakdown {
  clarity: number;
  technicalDepth: number;
  structure: number;
  relevance: number;
  confidence: number;
}

export interface AnswerFeedback {
  overallScore: number;
  breakdown: AnswerBreakdown;
  strongPoints: string[];
  weakAreas: string[];
  improvementTips: string[];
  modelAnswer: string;
  keywordsUsed: string[];
  keywordsMissed: string[];
}

export interface QuestionResult {
  question: InterviewQuestion;
  userAnswer: string;
  durationSeconds: number;
  feedback: AnswerFeedback;
  timestamp: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  date: string; // ISO string
  role: string;
  level: string;
  topic: string;
  averageScore: number;
  questions: QuestionResult[];
  status: 'completed' | 'in_progress';
}

export interface CoachMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
}

export interface DailyTip {
  title: string;
  tip: string;
  drill: string;
}
