import { Context, SessionFlavor } from 'grammy';

export interface SessionData {
  language: string;
  token: string | null;
  linkEmailMode: boolean;
  userId: string | null;
  currentQuestionIndex: number;
  correctCount: number;
  questions: any[];
}

export type MyContext = Context & SessionFlavor<SessionData>;
