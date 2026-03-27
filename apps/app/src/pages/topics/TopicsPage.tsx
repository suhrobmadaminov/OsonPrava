import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { userService } from '@/services/userService';
import { useSettingsStore } from '@/stores/settingsStore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { cn, getProgressColor } from '@/lib/utils';

export default function TopicsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useSettingsStore();

  const { data: topics, isLoading } = useQuery({
    queryKey: ['topics'],
    queryFn: () => userService.getTopics(),
  });

  if (isLoading) return <LoadingSpinner className="min-h-[50vh]" />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">{t('topics.title')}</h1>

      <div className="space-y-3">
        {(topics || []).map((topic: { id: number; nameUz: string; nameCyr: string; nameRu: string; progress: number; questionCount: number }, i: number) => {
          const name = language === 'ru' ? topic.nameRu : language === 'uz-cyr' ? topic.nameCyr : topic.nameUz;

          return (
            <motion.button
              key={topic.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => navigate(`/topics/${topic.id}`)}
              className="card w-full flex items-center gap-4 hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className="flex-1 text-left">
                <p className="font-bold text-sm">{name}</p>
                <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">
                  {topic.questionCount} {t('tickets.questions')}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-16">
                  <div className="w-full h-2 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', getProgressColor(topic.progress || 0))}
                      style={{ width: `${topic.progress || 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-dark-muted">
                    {topic.progress || 0}%
                  </span>
                </div>
                <ChevronRight size={18} className="text-gray-300 dark:text-dark-muted" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
