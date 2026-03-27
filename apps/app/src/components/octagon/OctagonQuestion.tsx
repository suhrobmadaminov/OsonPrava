import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settingsStore';

interface Answer {
  id: string;
  textUz: string;
  textCyr: string;
  textRu: string;
}

interface Question {
  id: string;
  textUz: string;
  textCyr: string;
  textRu: string;
  imageUrl?: string;
  answers: Answer[];
}

interface Props {
  question: Question;
  selectedAnswerId: string | null;
  isAnswered: boolean;
  onSelectAnswer: (answerId: string) => void;
}

function getLocalizedText(q: { textUz: string; textCyr: string; textRu: string }, lang: string) {
  if (lang === 'ru') return q.textRu;
  if (lang === 'uz-cyr') return q.textCyr;
  return q.textUz;
}

export default function OctagonQuestion({ question, selectedAnswerId, isAnswered, onSelectAnswer }: Props) {
  const { language } = useSettingsStore();

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Question image */}
      {question.imageUrl && (
        <img
          src={question.imageUrl}
          alt=""
          className="w-full rounded-xl object-contain max-h-48"
        />
      )}

      {/* Question text */}
      <h2 className="text-lg font-bold leading-snug">
        {getLocalizedText(question, language)}
      </h2>

      {/* Answer options */}
      <div className="space-y-3">
        {question.answers.map((answer, index) => (
          <motion.button
            key={answer.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => !isAnswered && onSelectAnswer(answer.id)}
            disabled={isAnswered}
            className={cn(
              'answer-option w-full text-left flex items-center gap-3',
              isAnswered && selectedAnswerId === answer.id
                ? 'border-duo-blue bg-duo-blue/10'
                : '',
              !isAnswered && 'active:scale-[0.98] transition-transform',
            )}
          >
            <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-dark-border flex items-center justify-center text-xs font-bold text-gray-500 dark:text-dark-muted flex-shrink-0">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="flex-1 font-semibold text-sm">
              {getLocalizedText(answer, language)}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
