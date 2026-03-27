import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown } from 'lucide-react';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { cn } from '@/lib/utils';

type Period = 'daily' | 'weekly' | 'monthly' | 'all';

const periods: { key: Period; label: string }[] = [
  { key: 'daily', label: 'Bugun' },
  { key: 'weekly', label: 'Hafta' },
  { key: 'monthly', label: 'Oy' },
  { key: 'all', label: 'Barchasi' },
];

const topIcons = [Crown, Trophy, Medal];
const topColors = ['text-duo-yellow', 'text-gray-400', 'text-duo-orange'];

export default function LeaderboardPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<Period>('weekly');

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () => userService.getLeaderboard(period),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">{t('nav.leaderboard')}</h1>

      {/* Period tabs */}
      <div className="flex gap-2 bg-gray-100 dark:bg-dark-card rounded-xl p-1">
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-bold transition-all',
              period === p.key
                ? 'bg-white dark:bg-dark-border text-duo-green shadow-sm'
                : 'text-gray-500 dark:text-dark-muted',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner className="min-h-[40vh]" />
      ) : (
        <div className="space-y-2">
          {(leaderboard || []).map((entry: { userId: string; firstName: string; photoUrl: string | null; score: number; rank: number }, i: number) => {
            const isTop3 = i < 3;
            const isMe = entry.userId === user?.id;
            const Icon = topIcons[i];

            return (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  'card flex items-center gap-3',
                  isMe && 'border-duo-green border-2',
                )}
              >
                {/* Rank */}
                <div className="w-8 text-center">
                  {isTop3 && Icon ? (
                    <Icon size={24} className={topColors[i]} />
                  ) : (
                    <span className="font-bold text-gray-400 dark:text-dark-muted">{entry.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-duo-green/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {entry.photoUrl ? (
                    <img src={entry.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-duo-green">{entry.firstName[0]}</span>
                  )}
                </div>

                {/* Name */}
                <span className={cn('flex-1 font-bold text-sm', isMe && 'text-duo-green')}>
                  {entry.firstName} {isMe && '(Siz)'}
                </span>

                {/* Score */}
                <span className="font-extrabold text-duo-green">{entry.score}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
