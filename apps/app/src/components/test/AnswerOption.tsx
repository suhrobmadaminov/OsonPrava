import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  text: string;
  isSelected: boolean;
  isCorrect: boolean;
  isAnswered: boolean;
  onClick: () => void;
}

export default function AnswerOption({ text, isSelected, isCorrect, isAnswered, onClick }: Props) {
  const getClasses = () => {
    if (!isAnswered) {
      return isSelected ? 'border-duo-blue bg-duo-blue/10' : '';
    }
    if (isCorrect) return 'answer-correct';
    if (isSelected && !isCorrect) return 'answer-wrong';
    return 'opacity-60';
  };

  return (
    <button
      onClick={onClick}
      disabled={isAnswered}
      className={cn('answer-option w-full text-left flex items-center gap-3', getClasses())}
    >
      <span className="flex-1 font-semibold text-sm">{text}</span>

      {isAnswered && isCorrect && (
        <div className="w-6 h-6 bg-duo-green rounded-full flex items-center justify-center flex-shrink-0">
          <Check size={14} className="text-white" />
        </div>
      )}
      {isAnswered && isSelected && !isCorrect && (
        <div className="w-6 h-6 bg-duo-red rounded-full flex items-center justify-center flex-shrink-0">
          <X size={14} className="text-white" />
        </div>
      )}
    </button>
  );
}
