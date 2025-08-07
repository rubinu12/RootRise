// This file will be the single source of truth for your data shapes.

export interface Question {
  id: string;
  questionNumber: number;
  text: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  year?: number; 
  subject?: string;
  topic?: string;
  exam?: string;
  examYear?: string; // ADDED: Composite key for grouping
}

export interface UserAnswer {
  questionId: string;
  answer: string;
}