'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Ticket, BookOpen, Timer, Swords } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  ticket: Ticket,
  book: BookOpen,
  timer: Timer,
  swords: Swords,
};

const cardColors = [
  { bg: 'bg-duo-green', shadow: 'shadow-[0_6px_0_0_#4CAD01]' },
  { bg: 'bg-duo-blue', shadow: 'shadow-[0_6px_0_0_#1A9FDE]' },
  { bg: 'bg-duo-red', shadow: 'shadow-[0_6px_0_0_#E04343]' },
  { bg: 'bg-duo-purple', shadow: 'shadow-[0_6px_0_0_#B76FE0]' },
];

export function FeaturesSection() {
  const t = useTranslations('features');

  const items = [0, 1, 2, 3].map((i) => ({
    title: t(`items.${i}.title`),
    description: t(`items.${i}.description`),
    icon: t(`items.${i}.icon`),
  }));

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center text-3xl font-extrabold text-gray-900 sm:text-4xl"
        >
          {t('title')}
        </motion.h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = iconMap[item.icon] || Ticket;
            const color = cardColors[i];
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`rounded-2xl ${color.bg} ${color.shadow} p-6 text-white transition-all hover:-translate-y-1 active:translate-y-1 active:shadow-none`}
              >
                <div className="mb-4 inline-flex rounded-xl bg-white/20 p-3">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-xl font-extrabold">{item.title}</h3>
                <p className="text-sm font-semibold text-white/80">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
