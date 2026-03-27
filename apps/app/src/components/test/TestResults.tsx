import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Clock, Target, RotateCcw, AlertCircle } from 'lucide-react';
import { formatTime, formatPercent, getScoreColor } from '@/lib/utils';

interface Props {
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  timeSpentSec: number;
  onRetry?: () => void;
  onReviewMistakes?: () => void;
}

export default function TestResults({
  correctCount,
  wrongCount,
  totalQuestions,
  timeSpentSec,
  onRetry,
  onReviewMistakes,
}: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const percent = formatPercent(correctCount, totalQuestions);
  const passed = percent >= 72;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card text-center space-y-6 py-8"
    >
      {/* Result emoji */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="text-6xl"
      >
        {passed ? '🎉' : '😔'}
      </motion.div>

      {/* Score */}
      <div>
        <div className={`text-5xl font-extrabold ${getScoreColor(percent)}`}>
          {percent}%
        </div>
        <p className="text-gray-500 dark:text-dark-muted mt-1 font-semibold">
          {t('test.result')}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <Target size={20} className="text-duo-green mx-auto mb-1" />
          <div className="text-lg font-bold">{correctCount}</div>
          <div className="text-xs text-gray-500 dark:text-dark-muted">{t('test.correct')}</div>
        </div>
        <div className="card">
          <AlertCircle size={20} className="text-duo-red mx-auto mb-1" />
          <div className="text-lg font-bold">{wrongCount}</div>
          <div className="text-xs text-gray-500 dark:text-dark-muted">{t('test.wrong')}</div>
        </div>
        <div className="card">
          <Clock size={20} className="text-duo-blue mx-auto mb-1" />
          <div className="text-lg font-bold">{formatTime(timeSpentSec)}</div>
          <div className="text-xs text-gray-500 dark:text-dark-muted">{t('test.time')}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {onRetry && (
          <button onClick={onRetry} className="btn-primary flex items-center justify-center gap-2">
            <RotateCcw size={18} />
            {t('test.tryAgain')}
          </button>
        )}
        {wrongCount > 0 && onReviewMistakes && (
          <button onClick={onReviewMistakes} className="btn-secondary flex items-center justify-center gap-2">
            <AlertCircle size={18} />
            {t('test.reviewMistakes')}
          </button>
        )}
        <button onClick={() => navigate('/')} className="btn-secondary">
          {t('nav.dashboard')}
        </button>
      </div>
    </motion.div>
  );
}
