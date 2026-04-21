import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Medal, Lock } from 'lucide-react';
import { userService } from '@/services/userService';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function AchievementsPage() {
  const { t } = useTranslation();

  const { data: achievements, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => userService.getAchievements(),
  });

  if (isLoading) return <LoadingSpinner className="min-h-[50vh]" />;

  const earned = (achievements || []).filter((a: { unlockedAt: string | null }) => a.unlockedAt);
  const locked = (achievements || []).filter((a: { unlockedAt: string | null }) => !a.unlockedAt);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Medal size={28} className="text-duo-yellow" />
        <h1 className="text-2xl font-extrabold">{t('nav.achievements')}</h1>
        <span className="bg-duo-green/10 text-duo-green text-sm font-bold px-2 py-0.5 rounded-full">
          {earned.length}/{(achievements || []).length}
        </span>
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {earned.map((ach: { id: string; icon: string; title: string; description: string; unlockedAt: string }, i: number) => (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="card text-center py-4 border-duo-yellow/30"
            >
              <div className="text-4xl mb-2">{ach.icon}</div>
              <h3 className="font-bold text-sm">{ach.title}</h3>
              <p className="text-[10px] text-gray-500 dark:text-dark-muted mt-1">{ach.description}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <>
          <h2 className="font-bold text-sm text-gray-500 dark:text-dark-muted flex items-center gap-2">
            <Lock size={14} /> Qolgan yutuqlar
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {locked.map((ach: { id: string; icon: string; title: string; description: string }, i: number) => (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="card text-center py-4 opacity-50 grayscale"
              >
                <div className="text-4xl mb-2">{ach.icon}</div>
                <h3 className="font-bold text-sm">{ach.title}</h3>
                <p className="text-[10px] text-gray-500 dark:text-dark-muted mt-1">{ach.description}</p>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
