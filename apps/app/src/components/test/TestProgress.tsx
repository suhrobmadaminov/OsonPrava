import { cn } from '@/lib/utils';

interface Props {
  current: number;
  total: number;
  answers: Record<string, { isCorrect: boolean }>;
  questionIds: string[];
  onNavigate: (index: number) => void;
}

export default function TestProgress({ current, total, answers, questionIds, onNavigate }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {questionIds.map((qId, i) => {
        const answer = answers[qId];
        const isCurrent = i === current;

        return (
          <button
            key={qId}
            onClick={() => onNavigate(i)}
            title={`${i + 1} / ${total}`}
            className={cn(
              'w-8 h-8 rounded-lg text-xs font-bold transition-all',
              isCurrent && 'ring-2 ring-duo-blue ring-offset-2 dark:ring-offset-dark-bg',
              !answer && 'bg-gray-200 dark:bg-dark-border text-gray-500 dark:text-dark-muted',
              answer?.isCorrect && 'bg-duo-green text-white',
              answer && !answer.isCorrect && 'bg-duo-red text-white',
            )}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
