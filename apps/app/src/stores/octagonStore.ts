import { create } from 'zustand';

interface Opponent {
  id: string;
  firstName: string;
  photoUrl: string | null;
}

type OctagonStatus = 'idle' | 'searching' | 'matched' | 'playing' | 'finished';

interface OctagonState {
  status: OctagonStatus;
  matchId: string | null;
  opponent: Opponent | null;
  myScore: number;
  opponentScore: number;
  currentQuestionIndex: number;
  totalQuestions: number;

  setSearching: () => void;
  setMatched: (matchId: string, opponent: Opponent) => void;
  setPlaying: () => void;
  updateMyScore: (score: number) => void;
  updateOpponentScore: (score: number) => void;
  setQuestionIndex: (index: number, total: number) => void;
  setFinished: () => void;
  reset: () => void;
}

export const useOctagonStore = create<OctagonState>((set) => ({
  status: 'idle',
  matchId: null,
  opponent: null,
  myScore: 0,
  opponentScore: 0,
  currentQuestionIndex: 0,
  totalQuestions: 10,

  setSearching: () => set({ status: 'searching' }),
  setMatched: (matchId, opponent) => set({ status: 'matched', matchId, opponent }),
  setPlaying: () => set({ status: 'playing' }),
  updateMyScore: (myScore) => set({ myScore }),
  updateOpponentScore: (opponentScore) => set({ opponentScore }),
  setQuestionIndex: (currentQuestionIndex, totalQuestions) => set({ currentQuestionIndex, totalQuestions }),
  setFinished: () => set({ status: 'finished' }),
  reset: () =>
    set({
      status: 'idle',
      matchId: null,
      opponent: null,
      myScore: 0,
      opponentScore: 0,
      currentQuestionIndex: 0,
      totalQuestions: 10,
    }),
}));
