import api, { setAccessToken } from './api';

interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface User {
  id: string;
  telegramId?: string;
  email?: string;
  emailVerified?: boolean;
  firstName: string;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
  role: string;
  language: string;
  isPremium: boolean;
  streak: number;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  message?: string;
}

export const authService = {
  // Telegram
  async loginViaTelegram(data: TelegramAuthData): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/telegram', data);
    setAccessToken(res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    return res.data;
  },

  async loginViaTelegramBot(initData: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/telegram-bot', { initData });
    setAccessToken(res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    return res.data;
  },

  // Email
  async register(email: string, password: string, confirmPassword: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', { email, password, confirmPassword });
    setAccessToken(res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    return res.data;
  },

  async loginWithEmail(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    setAccessToken(res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    return res.data;
  },

  async verifyEmail(token: string) {
    const res = await api.post('/auth/verify-email', { token });
    return res.data;
  },

  async forgotPassword(email: string) {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(token: string, newPassword: string, confirmNewPassword: string) {
    const res = await api.post('/auth/reset-password', { token, newPassword, confirmNewPassword });
    return res.data;
  },

  async resendVerifyEmail(email: string) {
    const res = await api.post('/auth/resend-verify', { email });
    return res.data;
  },

  // Common
  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken }).catch(() => {});
    }
    setAccessToken(null);
    localStorage.removeItem('refreshToken');
  },
};
