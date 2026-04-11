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
  { path: '/tickets', icon: FileText, labelKey: 'nav.tickets', color: 'bg-duo-blue', gradient: 'from-duo-blue to-expressive-accent' },
  { path: '/topics', icon: BookOpen, labelKey: 'nav.topics', color: 'bg-duo-purple', gradient: 'from-duo-purple to-expressive-primary' },
  { path: '/exam', icon: GraduationCap, labelKey: 'nav.exam', color: 'bg-duo-green', gradient: 'from-duo-green to-expressive-success' },
  { path: '/marathon', icon: Infinity, labelKey: 'nav.marathon', color: 'bg-duo-orange', gradient: 'from-duo-orange to-expressive-warning' },
  { path: '/smart-test', icon: Brain, labelKey: 'nav.smartTest', color: 'bg-duo-yellow', gradient: 'from-duo-yellow to-expressive-warning' },
  { path: '/octagon', icon: Swords, labelKey: 'nav.octagon', color: 'bg-duo-red', gradient: 'from-duo-red to-expressive-secondary' },
  { path: '/mistakes', icon: AlertCircle, labelKey: 'nav.mistakes', color: 'bg-gray-500', gradient: 'from-gray-500 to-gray-600' },
  { path: '/leaderboard', icon: Trophy, labelKey: 'nav.leaderboard', color: 'bg-duo-purple', gradient: 'from-expressive-primary to-expressive-secondary' },
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
    <div className="section-expressive">
      {/* Greeting - Expressive Style */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-primary p-6 text-white shadow-expressive-lg"
      >
        {/* Animated background shapes */}
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 animate-float" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 animate-float-slow" />
        
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold">
            {t('dashboard.greeting', { name: user?.firstName || '' })}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Flame size={24} className="text-duo-yellow animate-wiggle" />
            <span className="font-bold text-lg">
              {t('dashboard.streak', { count: user?.streak || 0 })}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Progress card - Expressive Gradient */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-expressive-gradient"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-sm text-gray-700 dark:text-dark-text">{t('dashboard.progress')}</span>
          <span className="text-3xl font-extrabold bg-gradient-success bg-clip-text text-transparent">{totalProgress}%</span>
        </div>
        <div className="w-full h-4 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden shadow-inner-light">
          <div
            className={cn('h-full rounded-full transition-all duration-500', getProgressColor(totalProgress))}
            style={{ width: `${totalProgress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-dark-muted mt-3 font-semibold">
          {t('dashboard.questionsLearned')}: {stats?.correctAnswers || 0} / 1210
        </p>
      </motion.div>

      {/* Quick actions - Expressive Grid */}
      <div>
        <h2 className="heading-subtle mb-4">
          {t('dashboard.quickActions')}
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {quickActions.map(({ path, icon: Icon, labelKey, gradient }, i) => (
            <motion.button
              key={path}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(path)}
              className="card-expressive flex flex-col items-center gap-2 py-4 group"
            >
              <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br', gradient, 'shadow-expressive-sm group-hover:shadow-expressive transition-all')}>
                <Icon size={22} className="text-white" />
              </div>
              <span className="text-xs font-bold text-center leading-tight text-gray-700 dark:text-dark-text">
                {t(labelKey)}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Weekly streak calendar - Expressive */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-expressive"
      >
        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-dark-text">
          {t('dashboard.streak', { count: user?.streak || 0 })}
        </h3>
        <div className="flex justify-between">
          {['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Ya'].map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-dark-muted">{day}</span>
              <motion.div
                whileHover={{ scale: 1.2 }}
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold transition-all',
                  i < (user?.streak || 0) % 7
                    ? 'bg-gradient-primary text-white shadow-glow-primary'
                    : 'bg-gray-100 dark:bg-dark-border text-gray-400 dark:text-dark-muted',
                )}
              >
                {i < (user?.streak || 0) % 7 ? '✓' : '·'}
              </motion.div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
