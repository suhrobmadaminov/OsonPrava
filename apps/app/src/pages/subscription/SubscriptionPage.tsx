import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Crown, Check, Zap, Brain, Volume2, Trophy } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const plans = [
  { id: 'free', priceKey: 'subscription.free', price: '0', period: '', features: ['1210+ savollar', 'Biletlar va mavzular', 'Oktagon'] },
  { id: 'monthly', priceKey: 'subscription.monthly', price: '15 000', period: '/oy', features: ['Barcha bepul imkoniyatlar', 'Aqlli test (SM-2)', 'Tushuntirishlar audio', 'Reklamasiz', 'Prioritet qo\'llab-quvvatlash'], recommended: true },
  { id: 'yearly', priceKey: 'subscription.yearly', price: '99 000', period: '/yil', features: ['Barcha oylik imkoniyatlar', '45% chegirma', 'Maxsus badgelar'], save: '45%' },
];

const premiumFeatures = [
  { icon: Brain, title: 'Aqlli test', desc: 'SM-2 spaced repetition algoritmi' },
  { icon: Volume2, title: 'Audio tushuntirish', desc: 'Har bir javobga audio izoh' },
  { icon: Zap, title: 'Reklamasiz', desc: 'To\'liq reklama yo\'q' },
  { icon: Trophy, title: 'Maxsus badgelar', desc: 'Premium foydalanuvchi belgilari' },
];

export default function SubscriptionPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Crown size={40} className="text-duo-yellow mx-auto mb-2" />
        <h1 className="text-2xl font-extrabold">{t('subscription.title')}</h1>
      </div>

      {/* Plans */}
      <div className="space-y-3">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              'card relative',
              plan.recommended && 'border-duo-green border-2 shadow-lg',
            )}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-duo-green text-white text-xs font-bold px-3 py-1 rounded-full">
                Tavsiya etiladi
              </div>
            )}
            {plan.save && (
              <div className="absolute -top-3 right-4 bg-duo-red text-white text-xs font-bold px-2 py-1 rounded-full">
                -{plan.save}
              </div>
            )}

            <div className="flex items-center justify-between mb-3 pt-1">
              <span className="font-extrabold text-lg">{t(plan.priceKey)}</span>
              <div>
                <span className="text-2xl font-extrabold">{plan.price}</span>
                <span className="text-sm text-gray-500 dark:text-dark-muted"> so'm{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-2 mb-4">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-duo-green flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              className={cn(
                'w-full py-3 rounded-xl font-bold transition-all',
                plan.recommended ? 'btn-primary' : 'btn-secondary',
                user?.isPremium && plan.id !== 'free' && 'opacity-50',
              )}
              disabled={user?.isPremium && plan.id !== 'free'}
            >
              {user?.isPremium ? t('subscription.active') : t('subscription.subscribe')}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Features */}
      <div className="card space-y-4">
        <h3 className="font-bold">{t('subscription.features')}</h3>
        {premiumFeatures.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="w-10 h-10 bg-duo-yellow/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon size={20} className="text-duo-yellow" />
            </div>
            <div>
              <p className="font-bold text-sm">{title}</p>
              <p className="text-xs text-gray-500 dark:text-dark-muted">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
