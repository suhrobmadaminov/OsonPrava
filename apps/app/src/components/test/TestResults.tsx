import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Target, RotateCcw, AlertCircle } from 'lucide-react';
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
      className="card-expressive-gradient text-center space-y-6 py-8"
    >
      {/* Result emoji - Expressive */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="text-7xl animate-bounce-in"
      >
        {passed ? '🎉' : '😔'}
      </motion.div>

      {/* Score - Expressive */}
      <div>
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className={`text-6xl font-extrabold ${getScoreColor(percent)} bg-gradient-to-br from-expressive-success to-expressive-accent bg-clip-text`}
        >
          {percent}%
        </motion.div>
        <p className="text-gray-600 dark:text-dark-muted mt-2 font-semibold text-lg">
          {passed ? '✅ ' : '❌ '}{t('test.result')}
        </p>
      </div>

      {/* Stats grid - Expressive Cards */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          className="card-expressive text-center"
        >
          <Target size={24} className="text-expressive-success mx-auto mb-2" />
          <div className="text-2xl font-extrabold text-expressive-success">{correctCount}</div>
          <div className="text-xs text-gray-600 dark:text-dark-muted font-semibold">{t('test.correct')}</div>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          className="card-expressive text-center"
        >
          <AlertCircle size={24} className="text-expressive-danger mx-auto mb-2" />
          <div className="text-2xl font-extrabold text-expressive-danger">{wrongCount}</div>
          <div className="text-xs text-gray-600 dark:text-dark-muted font-semibold">{t('test.wrong')}</div>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          className="card-expressive text-center"
        >
          <Clock size={24} className="text-expressive-accent mx-auto mb-2" />
          <div className="text-2xl font-extrabold text-expressive-accent">{formatTime(timeSpentSec)}</div>
          <div className="text-xs text-gray-600 dark:text-dark-muted font-semibold">{t('test.time')}</div>
        </motion.div>
      </div>

      {/* Actions - Expressive Buttons */}
      <div className="flex flex-col gap-3">
        {onRetry && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetry} 
            className="btn-expressive flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            {t('test.tryAgain')}
          </motion.button>
        )}
        {wrongCount > 0 && onReviewMistakes && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReviewMistakes} 
            className="btn-expressive-secondary flex items-center justify-center gap-2"
          >
            <AlertCircle size={18} />
            {t('test.reviewMistakes')}
          </motion.button>
        )}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/')} 
          className="btn-secondary"
        >
          {t('nav.dashboard')}
        </motion.button>
      </div>
    </motion.div>
  );
}
