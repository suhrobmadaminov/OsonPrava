import { useTranslation } from 'react-i18next';
import type { Question } from '@/services/testService';
import { useSettingsStore } from '@/stores/settingsStore';
import AnswerOption from './AnswerOption';
import QuestionImage from './QuestionImage';
import ExplanationCard from './ExplanationCard';

interface Props {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswerId: string | null;
  isAnswered: boolean;
  onSelectAnswer: (answerId: string) => void;
}

function getLocalizedText(q: { textUz: string; textCyr: string; textRu: string }, lang: string) {
  if (lang === 'ru') return q.textRu;
  if (lang === 'uz-cyr') return q.textCyr;
  return q.textUz;
}

export default function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswerId,
  isAnswered,
  onSelectAnswer,
}: Props) {
  const { t } = useTranslation();
  const { language } = useSettingsStore();

  const correctAnswer = question.answers.find((a) => a.isCorrect);
  const explanationText = language === 'ru'
    ? question.explanationRu
    : language === 'uz-cyr'
      ? question.explanationCyr
      : question.explanationUz;

  return (
    <div className="space-y-4">
      {/* Question counter */}
      <div className="text-sm font-semibold text-gray-500 dark:text-dark-muted">
        {t('test.question')} {questionIndex + 1}{t('test.of')}{totalQuestions}
      </div>

      {/* Question image */}
      {question.imageUrl && <QuestionImage src={question.imageUrl} />}

      {/* Question text */}
      <h2 className="text-lg font-bold leading-snug">
        {getLocalizedText(question, language)}
      </h2>

      {/* Answer options */}
      <div className="space-y-3">
        {question.answers.map((answer) => (
          <AnswerOption
            key={answer.id}
            text={getLocalizedText(answer, language)}
            isSelected={selectedAnswerId === answer.id}
            isCorrect={answer.isCorrect}
            isAnswered={isAnswered}
            onClick={() => !isAnswered && onSelectAnswer(answer.id)}
          />
        ))}
      </div>

      {/* Explanation */}
      {isAnswered && explanationText && (
        <ExplanationCard
          text={explanationText}
          isCorrect={selectedAnswerId === correctAnswer?.id}
        />
      )}
    </div>
  );
}
