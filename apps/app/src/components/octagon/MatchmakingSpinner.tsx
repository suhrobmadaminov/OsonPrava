import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface Props {
  onCancel: () => void;
}

export default function MatchmakingSpinner({ onCancel }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-12">
      {/* Pulsing circles */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-duo-blue"
            initial={{ scale: 0.5, opacity: 0.8 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
              ease: 'easeOut',
            }}
          />
        ))}
        <motion.div
          className="w-16 h-16 bg-duo-blue/20 rounded-full flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-10 h-10 bg-duo-blue rounded-full" />
        </motion.div>
      </div>

      {/* Text */}
      <div className="text-center space-y-2">
        <motion.p
          className="text-lg font-bold"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {t('octagon.searching')}
        </motion.p>
        <p className="text-sm text-gray-500 dark:text-dark-muted font-semibold">
          {t('octagon.searchingHint')}
        </p>
      </div>

      {/* Cancel button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onCancel}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-dark-muted font-bold text-sm transition-colors hover:bg-gray-200 dark:hover:bg-dark-border"
      >
        <X size={18} />
        {t('octagon.cancel')}
      </motion.button>
    </div>
  );
}
