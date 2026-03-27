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

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    telegramId: string;
    firstName: string;
    lastName: string | null;
    username: string | null;
    photoUrl: string | null;
    role: string;
    language: string;
  };
}

export const authService = {
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
