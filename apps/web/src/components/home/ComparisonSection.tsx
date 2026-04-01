'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';

export function ComparisonSection() {
  const t = useTranslations('comparison');

  const plans = [
    {
      name: t('free.name'),
      price: t('free.price'),
      period: t('free.period'),
      features: t.raw('free.features'),
      button: t('free.button'),
      popular: false,
      color: 'bg-gray-50',
      borderColor: 'border-gray-200',
      buttonStyle: 'bg-gray-900 hover:bg-gray-800',
    },
    {
      name: t('premium.name'),
      price: t('premium.price'),
      period: t('premium.period'),
      features: t.raw('premium.features'),
      button: t('premium.button'),
      popular: true,
      color: 'bg-gradient-to-br from-duo-green/5 to-duo-blue/5',
      borderColor: 'border-duo-green',
      buttonStyle: 'bg-duo-green hover:bg-duo-green/90',
    },
  ];

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{t('title')}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">{t('subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`relative overflow-hidden rounded-3xl border-2 ${plan.borderColor} ${plan.color} p-8 transition-all hover:shadow-xl`}
            >
              {plan.popular && (
                <div className="absolute -right-12 top-6 rotate-45 bg-duo-green px-12 py-1">
                  <Star className="h-4 w-4 fill-white text-white" />
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-extrabold text-gray-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-sm font-semibold text-gray-500">{plan.period}</span>
                </div>
              </div>

              <ul className="mb-8 space-y-4">
                {plan.features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-duo-green" />
                    <span className="font-semibold text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="/app"
                className={`block w-full rounded-2xl px-6 py-4 text-center font-bold text-white shadow-[0_4px_0_0_#4CAD01] transition-all active:translate-y-1 active:shadow-none ${plan.buttonStyle}`}
              >
                {plan.button}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
