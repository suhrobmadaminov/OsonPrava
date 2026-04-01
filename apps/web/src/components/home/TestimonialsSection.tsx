'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export function TestimonialsSection() {
  const t = useTranslations('testimonials');

  const items = [
    {
      name: t('items.0.name'),
      location: t('items.0.location'),
      text: t('items.0.text'),
      rating: 5,
      result: t('items.0.result'),
    },
    {
      name: t('items.1.name'),
      location: t('items.1.location'),
      text: t('items.1.text'),
      rating: 5,
      result: t('items.1.result'),
    },
    {
      name: t('items.2.name'),
      location: t('items.2.location'),
      text: t('items.2.text'),
      rating: 5,
      result: t('items.2.result'),
    },
  ];

  return (
    <section className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_4px_0_0_#e5e7eb] transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <Quote className="absolute -right-4 -top-4 h-20 w-20 text-gray-100" />

              <div className="relative">
                <div className="mb-4 flex items-center gap-1">
                  {Array.from({ length: item.rating }).map((_, idx) => (
                    <Star key={idx} className="h-5 w-5 fill-duo-yellow text-duo-yellow" />
                  ))}
                </div>

                <p className="mb-6 text-lg font-semibold text-gray-700">{item.text}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.location}</p>
                  </div>
                  <span className="rounded-full bg-duo-green/10 px-3 py-1 text-sm font-bold text-duo-green">
                    {item.result}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
