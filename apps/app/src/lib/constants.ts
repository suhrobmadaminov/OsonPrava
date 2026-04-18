export const API_URL = import.meta.env.VITE_API_URL || 'https://osonpravabackend-production.up.railway.app/api/v1';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://osonpravabackend-production.up.railway.app';
export const TELEGRAM_BOT = 'https://t.me/EasyPrava_bot';

export const EXAM_QUESTION_COUNT = 20;
export const EXAM_TIME_LIMIT = 20 * 60; // 20 minutes in seconds
export const OCTAGON_QUESTION_TIME = 15; // seconds per question
export const OCTAGON_QUESTION_COUNT = 10;

export const TICKET_COUNT = 61;
export const TOTAL_QUESTIONS = 1210;

export const LANGUAGES = [
  { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
  { code: 'uz-cyr', label: 'Ўзбек', flag: '🇺🇿' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
] as const;

export type LangCode = (typeof LANGUAGES)[number]['code'];
