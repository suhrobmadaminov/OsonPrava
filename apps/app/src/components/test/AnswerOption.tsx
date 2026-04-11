import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
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
      return isSelected 
        ? 'border-expressive-primary/50 bg-expressive-primary/10 shadow-expressive' 
        : 'border-gray-200 dark:border-dark-border hover:border-expressive-primary/30 hover:shadow-expressive-sm';
    }
    if (isCorrect) return 'border-expressive-success bg-expressive-success/15 shadow-glow-success';
    if (isSelected && !isCorrect) return 'border-expressive-danger bg-expressive-danger/15 shadow-[0_0_20px_rgba(239,68,68,0.3)]';
    return 'opacity-60 border-gray-200 dark:border-dark-border';
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={isAnswered}
      whileHover={!isAnswered ? { scale: 1.02, y: -2 } : {}}
      whileTap={!isAnswered ? { scale: 0.98 } : {}}
      initial={false}
      animate={isAnswered && isCorrect ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.3 }}
      className={cn(
        'w-full text-left flex items-center gap-3 p-4 rounded-2xl border-2',
        'transition-all duration-300',
        getClasses()
      )}
    >
      <span className="flex-1 font-semibold text-sm text-gray-900 dark:text-dark-text">{text}</span>

      {isAnswered && isCorrect && (
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="w-7 h-7 bg-gradient-success rounded-full flex items-center justify-center flex-shrink-0 shadow-glow-success"
        >
          <Check size={16} className="text-white" />
        </motion.div>
      )}
      {isAnswered && isSelected && !isCorrect && (
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="w-7 h-7 bg-gradient-warning rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
        >
          <X size={16} className="text-white" />
        </motion.div>
      )}
    </motion.button>
  );
}
