import { useTranslation } from 'react-i18next';
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  text: string;
  isCorrect: boolean;
}

export default function ExplanationCard({ text, isCorrect }: Props) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'rounded-xl p-4 border-l-4',
        isCorrect
          ? 'bg-duo-green/10 border-duo-green dark:bg-duo-green/20'
          : 'bg-duo-red/10 border-duo-red dark:bg-duo-red/20',
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb size={18} className={isCorrect ? 'text-duo-green' : 'text-duo-red'} />
        <span className="font-bold text-sm">
          {isCorrect ? t('test.correct') : t('test.wrong')}
        </span>
      </div>
      <p className="text-sm text-gray-700 dark:text-dark-text leading-relaxed">{text}</p>
    </div>
  );
}
