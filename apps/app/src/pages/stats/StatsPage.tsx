import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Target, AlertCircle, Flame, Clock } from 'lucide-react';
import { userService } from '@/services/userService';
import { useSettingsStore } from '@/stores/settingsStore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { cn, getProgressColor } from '@/lib/utils';

export default function StatsPage() {
  const { t } = useTranslation();
  const { language } = useSettingsStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['detailed-stats'],
    queryFn: () => userService.getDetailedStats(),
  });

  if (isLoading) return <LoadingSpinner className="min-h-[50vh]" />;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">{t('nav.stats')}</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Target, label: t('test.correct'), value: stats.totalCorrect || 0, color: 'text-duo-green', bg: 'bg-duo-green/10' },
          { icon: AlertCircle, label: t('test.wrong'), value: stats.totalWrong || 0, color: 'text-duo-red', bg: 'bg-duo-red/10' },
          { icon: Flame, label: t('dashboard.streak', { count: stats.streak || 0 }), value: stats.streak || 0, color: 'text-duo-orange', bg: 'bg-duo-orange/10' },
          { icon: Clock, label: t('test.time'), value: `${Math.floor((stats.totalTimeSec || 0) / 60)}m`, color: 'text-duo-blue', bg: 'bg-duo-blue/10' },
        ].map(({ icon: Icon, label, value, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card flex items-center gap-3"
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bg)}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <div className="text-lg font-extrabold">{value}</div>
              <div className="text-xs text-gray-500 dark:text-dark-muted font-semibold">{label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Topics progress */}
      <div className="card space-y-4">
        <h3 className="font-bold">{t('topics.title')} — {t('topics.progress')}</h3>
        {(stats.topicProgress || []).map((topic: { id: number; nameUz: string; nameCyr: string; nameRu: string; progress: number }) => {
          const name = language === 'ru' ? topic.nameRu : language === 'uz-cyr' ? topic.nameCyr : topic.nameUz;
          return (
            <div key={topic.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-semibold truncate">{name}</span>
                <span className="font-bold text-gray-500 dark:text-dark-muted">{topic.progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', getProgressColor(topic.progress))}
                  style={{ width: `${topic.progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Test history */}
      <div className="card space-y-3">
        <h3 className="font-bold">{t('test.result')}</h3>
        {(stats.recentTests || []).slice(0, 10).map((test: { id: string; type: string; score: number; correctCount: number; totalQuestions: number; completedAt: string }) => (
          <div key={test.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-dark-border last:border-0">
            <div>
              <span className="font-semibold text-sm">{test.type}</span>
              <span className="text-xs text-gray-500 dark:text-dark-muted ml-2">
                {test.correctCount}/{test.totalQuestions}
              </span>
            </div>
            <span className={cn('font-bold text-sm', test.score >= 72 ? 'text-duo-green' : 'text-duo-red')}>
              {test.score}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
