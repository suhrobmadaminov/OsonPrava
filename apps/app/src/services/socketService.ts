import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/lib/constants';
import { getAccessToken } from './api';

let socket: Socket | null = null;

export const socketService = {
  connect() {
    if (socket?.connected) return socket;

    socket = io(`${SOCKET_URL}/octagon`, {
      auth: { token: getAccessToken() },
      transports: ['websocket'],
      autoConnect: true,
    });

    return socket;
  },

  disconnect() {
    socket?.disconnect();
    socket = null;
  },

  getSocket() {
    return socket;
  },

  findMatch() {
    socket?.emit('match:find');
  },

  cancelSearch() {
    socket?.emit('match:cancel');
  },

  submitAnswer(matchId: string, questionId: string, answerId: string) {
    socket?.emit('match:answer', { matchId, questionId, answerId });
  },

  onMatchFound(cb: (data: { matchId: string; opponent: { id: string; firstName: string; photoUrl: string } }) => void) {
    socket?.on('match:found', cb);
  },

  onQuestion(cb: (data: { question: unknown; questionIndex: number; totalQuestions: number }) => void) {
    socket?.on('match:question', cb);
  },

  onOpponentAnswer(cb: (data: { isCorrect: boolean; score: number }) => void) {
    socket?.on('match:opponent-answer', cb);
  },

  onMatchEnd(cb: (data: { winner: string; myScore: number; opponentScore: number }) => void) {
    socket?.on('match:end', cb);
  },

  offAll() {
    socket?.removeAllListeners();
  },
};
