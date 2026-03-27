import { useEffect } from 'react';
import { Clock } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Props {
  timeRemaining: number;
  onTick: (time: number) => void;
  onTimeUp: () => void;
}

export default function TestTimer({ timeRemaining, onTick, onTimeUp }: Props) {
  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeUp();
      return;
    }

    const timer = setTimeout(() => {
      onTick(timeRemaining - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeRemaining, onTick, onTimeUp]);

  const isLow = timeRemaining < 60;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold',
        isLow
          ? 'bg-duo-red/10 text-duo-red animate-pulse'
          : 'bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-dark-text',
      )}
    >
      <Clock size={16} />
      {formatTime(timeRemaining)}
    </div>
  );
}
