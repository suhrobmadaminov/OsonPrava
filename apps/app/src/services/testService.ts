import api from './api';

export type TestType = 'TICKET' | 'TOPIC' | 'EXAM' | 'MARATHON' | 'MISTAKES';

interface StartTestParams {
  type: TestType;
  ticketId?: number;
  topicId?: number;
}

export interface Question {
  id: string;
  textUz: string;
  textCyr: string;
  textRu: string;
  imageUrl: string | null;
  explanationUz: string | null;
  explanationCyr: string | null;
  explanationRu: string | null;
  answers: Answer[];
}

export interface Answer {
  id: string;
  textUz: string;
  textCyr: string;
  textRu: string;
  isCorrect: boolean;
}

export interface TestSession {
  id: string;
  type: TestType;
  questions: Question[];
  totalQuestions: number;
  timeLimit: number | null;
}

export interface TestResult {
  id: string;
  type: TestType;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  score: number;
  timeSpentSec: number;
  completedAt: string;
}

export const testService = {
  async startTest(params: StartTestParams): Promise<TestSession> {
    const res = await api.post('/tests/start', params);
    return res.data;
  },

  async answerQuestion(testId: string, questionId: string, selectedAnswerId: string, timeSpentSec: number) {
    const res = await api.post(`/tests/${testId}/answer`, { questionId, selectedAnswerId, timeSpentSec });
    return res.data;
  },

  async completeTest(testId: string): Promise<TestResult> {
    const res = await api.post(`/tests/${testId}/complete`);
    return res.data;
  },

  async getTest(testId: string): Promise<TestSession> {
    const res = await api.get(`/tests/${testId}`);
    return res.data;
  },

  async getHistory(page = 1, limit = 20): Promise<{ data: TestResult[]; total: number }> {
    const res = await api.get('/tests/history', { params: { page, limit } });
    return res.data;
  },
};
