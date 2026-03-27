import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Trophy, Frown, Handshake, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

type Result = 'win' | 'lose' | 'draw';

interface Props {
  result: Result;
  myScore: number;
  opponentScore: number;
  opponentName: string;
  onPlayAgain: () => void;
}

const resultConfig = {
  win: {
    icon: Trophy,
    color: 'text-duo-green',
    bg: 'bg-duo-green/10',
    border: 'border-duo-green/30',
  },
  lose: {
    icon: Frown,
    color: 'text-duo-red',
    bg: 'bg-duo-red/10',
    border: 'border-duo-red/30',
  },
  draw: {
    icon: Handshake,
    color: 'text-duo-yellow',
    bg: 'bg-duo-yellow/10',
    border: 'border-duo-yellow/30',
  },
};

export default function OctagonResult({ result, myScore, opponentScore, opponentName, onPlayAgain }: Props) {
  const { t } = useTranslation();
  const config = resultConfig[result];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="flex flex-col items-center gap-6 py-8"
    >
      {/* Result icon */}
      <motion.div
        initial={{ rotate: -20 }}
        animate={{ rotate: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className={cn('w-24 h-24 rounded-full flex items-center justify-center border-2', config.bg, config.border)}
      >
        <Icon size={48} className={config.color} />
      </motion.div>

      {/* Result text */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={cn('text-2xl font-extrabold', config.color)}
      >
        {t(`octagon.result.${result}`)}
      </motion.h2>

      {/* Score comparison */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card w-full max-w-xs px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-xs font-bold text-gray-400 dark:text-dark-muted uppercase mb-1">
              {t('octagon.you')}
            </p>
            <p className="text-3xl font-extrabold text-duo-blue">{myScore}</p>
          </div>
          <span className="text-gray-300 dark:text-dark-border font-extrabold text-xl">:</span>
          <div className="text-center">
            <p className="text-xs font-bold text-gray-400 dark:text-dark-muted uppercase mb-1 truncate max-w-[100px]">
              {opponentName}
            </p>
            <p className="text-3xl font-extrabold text-gray-600 dark:text-gray-300">{opponentScore}</p>
          </div>
        </div>
      </motion.div>

      {/* Play again */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileTap={{ scale: 0.95 }}
        onClick={onPlayAgain}
        className="flex items-center gap-2 bg-duo-green hover:bg-duo-green/90 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-colors"
      >
        <RotateCcw size={18} />
        {t('octagon.playAgain')}
      </motion.button>
    </motion.div>
  );
}
