import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  timeLeft: number;
  totalTime: number;
}

export default function OctagonTimer({ timeLeft, totalTime }: Props) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / totalTime;
  const strokeDashoffset = circumference * (1 - progress);
  const isWarning = timeLeft <= 5;

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg width="64" height="64" className="-rotate-90">
        {/* Background circle */}
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-gray-200 dark:text-dark-border"
        />
        {/* Progress circle */}
        <motion.circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className={cn(isWarning ? 'text-duo-red' : 'text-duo-blue')}
          stroke="currentColor"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'linear' }}
        />
      </svg>

      {/* Timer text */}
      <motion.span
        className={cn(
          'absolute text-lg font-extrabold',
          isWarning ? 'text-duo-red' : 'text-gray-700 dark:text-white',
        )}
        animate={isWarning ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        {timeLeft}
      </motion.span>
    </div>
  );
}
