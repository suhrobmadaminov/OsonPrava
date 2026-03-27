import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FileText, BookOpen, GraduationCap, Brain, Swords, AlertCircle,
  Infinity, Trophy, Flame,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { userService } from '@/services/userService';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { cn, formatPercent, getProgressColor } from '@/lib/utils';

const quickActions = [
  { path: '/tickets', icon: FileText, labelKey: 'nav.tickets', color: 'bg-duo-blue' },
  { path: '/topics', icon: BookOpen, labelKey: 'nav.topics', color: 'bg-duo-purple' },
  { path: '/exam', icon: GraduationCap, labelKey: 'nav.exam', color: 'bg-duo-green' },
  { path: '/marathon', icon: Infinity, labelKey: 'nav.marathon', color: 'bg-duo-orange' },
  { path: '/smart-test', icon: Brain, labelKey: 'nav.smartTest', color: 'bg-duo-yellow' },
  { path: '/octagon', icon: Swords, labelKey: 'nav.octagon', color: 'bg-duo-red' },
  { path: '/mistakes', icon: AlertCircle, labelKey: 'nav.mistakes', color: 'bg-gray-500' },
  { path: '/leaderboard', icon: Trophy, labelKey: 'nav.leaderboard', color: 'bg-duo-purple' },
];

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => userService.getStats(),
  });

  if (isLoading) return <LoadingSpinner className="min-h-[50vh]" />;

  const totalProgress = stats ? formatPercent(stats.correctAnswers || 0, 1210) : 0;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold">
          {t('dashboard.greeting', { name: user?.firstName || '' })}
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <Flame size={20} className="text-duo-orange" />
          <span className="font-bold text-duo-orange">
            {t('dashboard.streak', { count: user?.streak || 0 })}
          </span>
        </div>
      </motion.div>

      {/* Progress card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-sm">{t('dashboard.progress')}</span>
          <span className="text-2xl font-extrabold text-duo-green">{totalProgress}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', getProgressColor(totalProgress))}
            style={{ width: `${totalProgress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-dark-muted mt-2 font-semibold">
          {t('dashboard.questionsLearned')}: {stats?.correctAnswers || 0} / 1210
        </p>
      </motion.div>

      {/* Quick actions */}
      <div>
        <h2 className="font-bold text-sm mb-3 text-gray-500 dark:text-dark-muted">
          {t('dashboard.quickActions')}
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map(({ path, icon: Icon, labelKey, color }, i) => (
            <motion.button
              key={path}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i }}
              onClick={() => navigate(path)}
              className="card flex flex-col items-center gap-2 py-4 hover:shadow-md transition-shadow active:scale-95"
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
                <Icon size={20} className="text-white" />
              </div>
              <span className="text-[11px] font-bold text-center leading-tight">
                {t(labelKey)}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Weekly streak calendar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h3 className="font-bold text-sm mb-3">{t('dashboard.streak', { count: user?.streak || 0 })}</h3>
        <div className="flex justify-between">
          {['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Ya'].map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-semibold text-gray-400 dark:text-dark-muted">{day}</span>
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-sm',
                  i < (user?.streak || 0) % 7
                    ? 'bg-duo-green text-white'
                    : 'bg-gray-100 dark:bg-dark-border text-gray-400 dark:text-dark-muted',
                )}
              >
                {i < (user?.streak || 0) % 7 ? '✓' : '·'}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
