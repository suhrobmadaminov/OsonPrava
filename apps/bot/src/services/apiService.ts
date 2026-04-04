import axios from 'axios';
import { config } from '../config';

const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'X-Bot-Key': config.botApiKey,
  },
  timeout: 10000,
});

export const apiService = {
  async loginUser(telegramData: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    language_code?: string;
  }) {
    const res = await api.post('/auth/telegram-bot', { initData: JSON.stringify(telegramData) });
    return res.data;
  },

  async getRandomQuestions(count = 5, token?: string) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await api.get(`/questions/random?count=${count}`, { headers });
    return res.data;
  },

  async getTickets(token: string) {
    const res = await api.get('/tickets', { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  },

  async getTicketQuestions(ticketId: number, token: string) {
    const res = await api.get(`/tickets/${ticketId}/questions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  async getUserStats(token: string) {
    const res = await api.get('/stats', { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  },

  async startTest(type: string, token: string, opts?: { ticketId?: number }) {
    const res = await api.post('/tests/start', { type, ...opts }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  async answerQuestion(testId: string, questionId: string, answerId: string, token: string) {
    const res = await api.post(`/tests/${testId}/answer`, {
      questionId, selectedAnswerId: answerId, timeSpentSec: 10,
    }, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  },

  async completeTest(testId: string, token: string) {
    const res = await api.post(`/tests/${testId}/complete`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  async createStarsSubscription(userId: string, plan: string, paymentId: string, token: string) {
    const res = await api.post('/subscription/telegram-stars', {
      userId, plan, telegramPaymentId: paymentId,
    }, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  },

  async linkEmail(userId: string, email: string) {
    const res = await api.post('/auth/link-email', { userId, email });
    return res.data;
  },
};
