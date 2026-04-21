import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { userService } from '@/services/userService';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { cn, formatPercent } from '@/lib/utils';

export default function TicketsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => userService.getTickets(),
  });

  if (isLoading) return <LoadingSpinner className="min-h-[50vh]" />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">{t('tickets.title')}</h1>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {(tickets || []).map((ticket: { id: number; number: number; correctCount?: number; totalQuestions: number }, i: number) => {
          const progress = ticket.correctCount
            ? formatPercent(ticket.correctCount, ticket.totalQuestions)
            : 0;

          return (
            <motion.button
              key={ticket.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              className="card flex flex-col items-center gap-2 py-4 hover:shadow-md transition-all active:scale-95"
            >
              <span className="text-lg font-extrabold">{ticket.number}</span>

              {/* Progress ring */}
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18" cy="18" r="15" fill="none"
                    className="stroke-gray-200 dark:stroke-dark-border"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18" cy="18" r="15" fill="none"
                    className={cn(
                      progress >= 90 ? 'stroke-duo-green' :
                      progress >= 70 ? 'stroke-duo-yellow' :
                      progress > 0 ? 'stroke-duo-orange' : 'stroke-gray-300',
                    )}
                    strokeWidth="3"
                    strokeDasharray={`${progress * 0.9425} 94.25`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                  {progress}%
                </span>
              </div>

              <span className="text-[10px] font-semibold text-gray-400 dark:text-dark-muted">
                {ticket.totalQuestions} {t('tickets.questions')}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
