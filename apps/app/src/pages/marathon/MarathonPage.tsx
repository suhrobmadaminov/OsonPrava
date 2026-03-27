import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { testService } from '@/services/testService';
import { useTestStore } from '@/stores/testStore';
import QuestionCard from '@/components/test/QuestionCard';
import QuestionNavigator from '@/components/test/QuestionNavigator';
import TestResults from '@/components/test/TestResults';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function MarathonPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [startTime] = useState(Date.now());

  const {
    testId, questions, currentIndex, answers, isCompleted,
    startTest, setCurrentIndex, recordAnswer, completeTest, reset,
  } = useTestStore();

  useEffect(() => {
    const init = async () => {
      try {
        const session = await testService.startTest({ type: 'MARATHON' });
        startTest(session.id, 'MARATHON', session.questions, null);
      } catch {
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    reset();
    init();
    return () => { reset(); };
  }, [navigate, startTest, reset]);

  const handleAnswer = useCallback(async (answerId: string) => {
    const question = questions[currentIndex];
    if (!testId || !question) return;
    const isCorrect = question.answers.find((a) => a.id === answerId)?.isCorrect || false;
    recordAnswer(question.id, answerId, isCorrect);
    await testService.answerQuestion(testId, question.id, answerId, Math.floor((Date.now() - startTime) / 1000)).catch(() => {});
  }, [testId, questions, currentIndex, recordAnswer, startTime]);

  const handleComplete = useCallback(async () => {
    if (!testId) return;
    await testService.completeTest(testId).catch(() => {});
    completeTest();
  }, [testId, completeTest]);

  if (isLoading) return <LoadingSpinner className="min-h-[50vh]" />;
  if (!questions.length) return null;

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion.id];
  const correctCount = Object.values(answers).filter((a) => a.isCorrect).length;
  const wrongCount = Object.values(answers).filter((a) => !a.isCorrect).length;

  if (isCompleted) {
    return (
      <TestResults
        correctCount={correctCount}
        wrongCount={wrongCount}
        totalQuestions={questions.length}
        timeSpentSec={Math.floor((Date.now() - startTime) / 1000)}
        onRetry={() => navigate('/marathon', { replace: true })}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-extrabold">{t('nav.marathon')}</h1>
        <span className="text-sm font-bold text-gray-500 dark:text-dark-muted">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>
      <QuestionCard question={currentQuestion} questionIndex={currentIndex} totalQuestions={questions.length} selectedAnswerId={currentAnswer?.answerId || null} isAnswered={!!currentAnswer} onSelectAnswer={handleAnswer} />
      <QuestionNavigator currentIndex={currentIndex} totalQuestions={questions.length} isAnswered={!!currentAnswer} onPrev={() => setCurrentIndex(Math.max(0, currentIndex - 1))} onNext={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))} onFinish={handleComplete} />
    </div>
  );
}
