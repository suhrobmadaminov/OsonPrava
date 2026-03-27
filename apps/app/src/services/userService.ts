import api from './api';

export const userService = {
  async getProfile() {
    const res = await api.get('/users/me');
    return res.data;
  },

  async updateProfile(data: { firstName?: string; lastName?: string; language?: string }) {
    const res = await api.patch('/users/me', data);
    return res.data;
  },

  async getStats() {
    const res = await api.get('/stats');
    return res.data;
  },

  async getDetailedStats() {
    const res = await api.get('/stats/detailed');
    return res.data;
  },

  async getAchievements() {
    const res = await api.get('/achievements');
    return res.data;
  },

  async getLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all' = 'weekly') {
    const res = await api.get('/leaderboard', { params: { period } });
    return res.data;
  },

  async getTickets() {
    const res = await api.get('/tickets');
    return res.data;
  },

  async getTicketQuestions(ticketId: number) {
    const res = await api.get(`/tickets/${ticketId}/questions`);
    return res.data;
  },

  async getTopics() {
    const res = await api.get('/topics');
    return res.data;
  },

  async getTopicQuestions(topicId: number) {
    const res = await api.get(`/topics/${topicId}/questions`);
    return res.data;
  },

  async getSubscriptionPlans() {
    const res = await api.get('/subscription/plans');
    return res.data;
  },

  async getNotifications(page = 1) {
    const res = await api.get('/notifications', { params: { page } });
    return res.data;
  },

  async markNotificationRead(id: string) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
};
