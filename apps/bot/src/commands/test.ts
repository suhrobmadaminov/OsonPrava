import { Bot } from 'grammy';
import { MyContext } from '../types';
import { apiService } from '../services/apiService';
import { getAnswerKeyboard } from '../keyboards/testKeyboard';
import { formatQuestion } from '../utils/formatting';
import { fallbackQuestions } from '../data/fallbackQuestions';

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getFallbackQuestions(count: number, lang: string) {
  const shuffled = shuffleArray(fallbackQuestions);
  return shuffled.slice(0, count).map((q) => ({
    id: q.id,
    text: lang === 'ru' ? q.textRu : lang === 'kr' ? q.textCyr : q.textUz,
    imageUrl: q.imageUrl,
    answers: q.answers.map((a) => ({
      id: a.id,
      text: lang === 'ru' ? a.textRu : lang === 'kr' ? a.textCyr : a.textUz,
      isCorrect: a.isCorrect,
    })),
  }));
}

export async function startQuickTest(ctx: any) {
  const lang = ctx.session.language || 'uz';

  try {
    // Try API first
    const questions = await apiService.getRandomQuestions(5, ctx.session.token);

    ctx.session.questions = questions.map((q: any) => ({
      id: q.id,
      text: lang === 'ru' ? q.textRu : lang === 'kr' ? q.textCyr : q.textUz,
      imageUrl: q.imageUrl,
      answers: q.answers.map((a: any) => ({
        id: a.id,
        text: lang === 'ru' ? a.textRu : lang === 'kr' ? a.textCyr : a.textUz,
        isCorrect: a.isCorrect,
      })),
    }));
    ctx.session.currentQuestionIndex = 0;
    ctx.session.correctCount = 0;

    await sendQuestion(ctx, 0);
  } catch (err) {
    // API unavailable — use fallback questions
    console.warn('API unavailable, using fallback questions');
    ctx.session.questions = getFallbackQuestions(5, lang);
    ctx.session.currentQuestionIndex = 0;
    ctx.session.correctCount = 0;

    await sendQuestion(ctx, 0);
  }
}

export async function sendQuestion(ctx: any, index: number) {
  const questions = ctx.session.questions;
  if (index >= questions.length) return;

  const q = questions[index];
  const text = formatQuestion(index + 1, questions.length, q.text);
  const keyboard = getAnswerKeyboard(q.answers, index);

  if (q.imageUrl) {
    await ctx.replyWithPhoto(q.imageUrl, {
      caption: text,
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
  } else {
    await ctx.reply(text, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
  }
}

export function setupTestCommand(bot: Bot<MyContext>) {
  bot.command('test', async (ctx) => {
    ctx.session.currentQuestionIndex = 0;
    ctx.session.correctCount = 0;
    ctx.session.questions = [];
    await startQuickTest(ctx);
  });
}
