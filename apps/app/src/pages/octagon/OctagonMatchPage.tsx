import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOctagonStore } from '@/stores/octagonStore';
import { socketService } from '@/services/socketService';
import { OCTAGON_QUESTION_TIME } from '@/lib/constants';
import OctagonScoreboard from '@/components/octagon/OctagonScoreboard';
import OctagonQuestion from '@/components/octagon/OctagonQuestion';
import OctagonTimer from '@/components/octagon/OctagonTimer';
import { useAuthStore } from '@/stores/authStore';

interface OctagonQuestionData {
  id: string;
  textUz: string;
  textCyr: string;
  textRu: string;
  imageUrl?: string;
  answers: {
    id: string;
    textUz: string;
    textCyr: string;
    textRu: string;
  }[];
}

export default function OctagonMatchPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const {
    opponent,
    myScore,
    opponentScore,
    currentQuestionIndex,
    totalQuestions,
    setPlaying,
    updateMyScore,
    updateOpponentScore,
    setQuestionIndex,
    setFinished,
  } = useOctagonStore();

  const [question, setQuestion] = useState<OctagonQuestionData | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(OCTAGON_QUESTION_TIME);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    setTimeLeft(OCTAGON_QUESTION_TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsAnswered(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  useEffect(() => {
    setPlaying();

    socketService.onQuestion((data) => {
      const q = data.question as OctagonQuestionData;
      setQuestion(q);
      setQuestionIndex(data.questionIndex, data.totalQuestions);
      setSelectedAnswerId(null);
      setIsAnswered(false);
      startTimer();
    });

    socketService.onOpponentAnswer((data) => {
      updateOpponentScore(data.score);
    });

    socketService.onMatchEnd((data) => {
      clearTimer();
      updateMyScore(data.myScore);
      updateOpponentScore(data.opponentScore);
      setFinished();
      navigate(`/octagon/results/${matchId}`, { replace: true });
    });

    return () => {
      clearTimer();
      socketService.offAll();
      socketService.disconnect();
    };
  }, [
    setPlaying,
    setQuestionIndex,
    updateMyScore,
    updateOpponentScore,
    setFinished,
    startTimer,
    clearTimer,
    navigate,
  ]);

  const handleSelectAnswer = (answerId: string) => {
    if (isAnswered || !matchId || !question) return;

    setSelectedAnswerId(answerId);
    setIsAnswered(true);
    clearTimer();
    socketService.submitAnswer(matchId, question.id, answerId);
  };

  if (!question || !opponent) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-duo-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
      {/* Scoreboard */}
      <OctagonScoreboard
        me={{ name: user?.firstName ?? '...', photoUrl: user?.photoUrl ?? null, score: myScore }}
        opponent={{ name: opponent.firstName, photoUrl: opponent.photoUrl, score: opponentScore }}
        questionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
      />

      {/* Timer */}
      <div className="flex justify-center">
        <OctagonTimer timeLeft={timeLeft} totalTime={OCTAGON_QUESTION_TIME} />
      </div>

      {/* Question */}
      <OctagonQuestion
        question={question}
        selectedAnswerId={selectedAnswerId}
        isAnswered={isAnswered}
        onSelectAnswer={handleSelectAnswer}
      />
    </div>
  );
}
