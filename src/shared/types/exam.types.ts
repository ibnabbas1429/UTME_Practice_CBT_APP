export interface Question {
  id: string;
  examId: string;
  subject: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  imageUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  subjects: string[];
  duration: number; // in minutes
  totalQuestions: number;
  passingScore: number;
  instructions: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExamSession {
  id: string;
  examId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  status: 'in-progress' | 'completed' | 'abandoned';
  answers: Record<string, string>; // questionId -> answer
  timeSpent: number; // in seconds
}

export interface ExamResult {
  id: string;
  examId: string;
  userId: string;
  sessionId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  percentage: number;
  passed: boolean;
  subjectScores: Record<string, SubjectScore>;
  completedAt: Date;
}

export interface SubjectScore {
  subject: string;
  total: number;
  correct: number;
  percentage: number;
}

export interface Answer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  markedForReview: boolean;
}