import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import api from '@/services/api';
import { useTestStore } from '@/stores/testStore';
import QuestionCard from '@/components/test/QuestionCard';
import QuestionNavigator from '@/components/test/QuestionNavigator';
import TestResults from '@/components/test/TestResults';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function SmartTestPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [smartStats, setSmartStats] = useState<{ learned: number; total: number } | null>(null);
  const [started, setStarted] = useState(false);
  const [startTime] = useState(Date.now());

  const {
    testId, questions, currentIndex, answers, isCompleted,
    startTest, setCurrentIndex, recordAnswer, completeTest, reset,
  } = useTestStore();

  useEffect(() => {
    api.get('/smart-test/stats').then((res) => {
      setSmartStats(res.data);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const handleStart = async () => {
    try {
      setIsLoading(true);
      const res = await api.post('/smart-test/start');
      startTest(res.data.id, 'MISTAKES', res.data.questions, null);
      setStarted(true);
    } catch {
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = useCallback(async (answerId: string) => {
    const question = questions[currentIndex];
    if (!testId || !question) return;
    const isCorrect = question.answers.find((a) => a.id === answerId)?.isCorrect || false;
    recordAnswer(question.id, answerId, isCorrect);
    await api.post(`/smart-test/${testId}/answer`, {
      questionId: question.id, selectedAnswerId: answerId,
      timeSpentSec: Math.floor((Date.now() - startTime) / 1000),
    }).catch(() => {});
  }, [testId, questions, currentIndex, recordAnswer, startTime]);

  const handleComplete = useCallback(async () => {
    if (!testId) return;
    await api.post(`/smart-test/${testId}/complete`).catch(() => {});
    completeTest();
  }, [testId, completeTest]);

  if (isLoading) return <LoadingSpinner className="min-h-[50vh]" />;

  if (!started) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card text-center space-y-6 py-8">
        <div className="w-20 h-20 bg-duo-yellow/20 rounded-2xl flex items-center justify-center mx-auto">
          <Brain size={40} className="text-duo-yellow" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold">{t('smartTest.title')}</h1>
          <p className="text-gray-500 dark:text-dark-muted mt-1">{t('smartTest.subtitle')}</p>
        </div>
        {smartStats && (
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-extrabold text-duo-green">{smartStats.learned}</div>
              <div className="text-xs font-semibold text-gray-500 dark:text-dark-muted">{t('smartTest.learned')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-duo-orange">{smartStats.total - smartStats.learned}</div>
              <div className="text-xs font-semibold text-gray-500 dark:text-dark-muted">{t('smartTest.remaining')}</div>
            </div>
          </div>
        )}
        <button onClick={handleStart} className="btn-primary text-lg px-10">{t('smartTest.start')}</button>
      </motion.div>
    );
  }

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
        onRetry={() => { reset(); setStarted(false); }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-extrabold">{t('smartTest.title')}</h1>
      <QuestionCard question={currentQuestion} questionIndex={currentIndex} totalQuestions={questions.length} selectedAnswerId={currentAnswer?.answerId || null} isAnswered={!!currentAnswer} onSelectAnswer={handleAnswer} />
      <QuestionNavigator currentIndex={currentIndex} totalQuestions={questions.length} isAnswered={!!currentAnswer} onPrev={() => setCurrentIndex(Math.max(0, currentIndex - 1))} onNext={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))} onFinish={handleComplete} />
    </div>
  );
}
