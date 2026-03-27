import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  currentIndex: number;
  totalQuestions: number;
  isAnswered: boolean;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export default function QuestionNavigator({
  currentIndex,
  totalQuestions,
  isAnswered,
  onPrev,
  onNext,
  onFinish,
}: Props) {
  const { t } = useTranslation();
  const isLast = currentIndex === totalQuestions - 1;

  return (
    <div className="flex items-center justify-between mt-6">
      <button
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="btn-secondary flex items-center gap-1 disabled:opacity-30"
      >
        <ChevronLeft size={18} />
        {t('test.prev')}
      </button>

      {isLast && isAnswered ? (
        <button onClick={onFinish} className="btn-primary">
          {t('test.finish')}
        </button>
      ) : (
        <button
          onClick={onNext}
          disabled={!isAnswered}
          className="btn-primary flex items-center gap-1 disabled:opacity-30"
        >
          {t('test.next')}
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}
