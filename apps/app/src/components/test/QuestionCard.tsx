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
    <div className="space-y-5">
      {/* Question counter - Expressive */}
      <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-primary/10 dark:bg-gradient-primary/20 backdrop-blur-sm">
        <span className="text-sm font-bold bg-gradient-primary bg-clip-text text-transparent">
          {t('test.question')} {questionIndex + 1}{t('test.of')}{totalQuestions}
        </span>
      </div>

      {/* Question image */}
      {question.imageUrl && <QuestionImage src={question.imageUrl} />}

      {/* Question text - Expressive */}
      <h2 className="text-xl font-extrabold leading-snug text-gray-900 dark:text-dark-text">
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
