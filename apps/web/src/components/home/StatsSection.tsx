'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { HelpCircle, Ticket, BadgeCheck, Languages } from 'lucide-react';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

const statColors = [
  { bg: 'bg-duo-green/10', text: 'text-duo-green', icon: HelpCircle },
  { bg: 'bg-duo-blue/10', text: 'text-duo-blue', icon: Ticket },
  { bg: 'bg-duo-red/10', text: 'text-duo-red', icon: BadgeCheck },
  { bg: 'bg-duo-purple/10', text: 'text-duo-purple', icon: Languages },
];

export function StatsSection() {
  const t = useTranslations('stats');

  const stats = [
    { count: 1210, suffix: '+', label: t('questions') },
    { count: 61, suffix: '', label: t('tickets') },
    { count: 100, suffix: '%', label: t('accuracy') },
    { count: 3, suffix: '', label: t('languages') },
  ];

  return (
    <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const color = statColors[i];
            const Icon = color.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="card-duo flex flex-col items-center p-6 text-center"
              >
                <div className={`mb-3 rounded-xl ${color.bg} p-3`}>
                  <Icon className={`h-6 w-6 ${color.text}`} />
                </div>
                <span className={`text-3xl font-extrabold ${color.text} sm:text-4xl`}>
                  <AnimatedCounter target={stat.count} suffix={stat.suffix} />
                </span>
                <span className="mt-1 text-sm font-bold uppercase tracking-wide text-gray-500">
                  {stat.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
