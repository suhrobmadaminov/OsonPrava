import { create } from 'zustand';
import type { Question, TestType } from '@/services/testService';

interface TestState {
  testId: string | null;
  type: TestType | null;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, { answerId: string; isCorrect: boolean }>;
  timeRemaining: number | null;
  isCompleted: boolean;

  startTest: (testId: string, type: TestType, questions: Question[], timeLimit: number | null) => void;
  setCurrentIndex: (index: number) => void;
  recordAnswer: (questionId: string, answerId: string, isCorrect: boolean) => void;
  setTimeRemaining: (time: number | null) => void;
  completeTest: () => void;
  reset: () => void;
}

export const useTestStore = create<TestState>((set) => ({
  testId: null,
  type: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  timeRemaining: null,
  isCompleted: false,

  startTest: (testId, type, questions, timeLimit) =>
    set({
      testId,
      type,
      questions,
      currentIndex: 0,
      answers: {},
      timeRemaining: timeLimit,
      isCompleted: false,
    }),

  setCurrentIndex: (currentIndex) => set({ currentIndex }),

  recordAnswer: (questionId, answerId, isCorrect) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: { answerId, isCorrect } },
    })),

  setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
  completeTest: () => set({ isCompleted: true }),
  reset: () =>
    set({
      testId: null,
      type: null,
      questions: [],
      currentIndex: 0,
      answers: {},
      timeRemaining: null,
      isCompleted: false,
    }),
}));
