'use client';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { APP_URL } from '@/lib/constants';
import { Check } from 'lucide-react';

export function CTA() {
  const locale = useLocale();

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-duo-green p-10 text-center shadow-[0_8px_0_0_#4CAD01] sm:p-16"
      >
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Hoziroq tayyorgarlikni boshlang!</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg font-semibold text-white/80">
          10,000+ foydalanuvchilar OsonPrava yordamida imtihondan muvaffaqiyatli o'tishmoqda.
        </p>

        {/* Features checklist */}
        <div className="mx-auto mt-6 flex max-w-lg flex-wrap items-center justify-center gap-3 text-sm font-semibold text-white/90">
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4" />
            <span>1210+ savol</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4" />
            <span>Bepul</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4" />
            <span>Reklamasiz</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={APP_URL}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-8 py-4 text-lg font-bold text-duo-green shadow-[0_4px_0_0_#e5e7eb] transition-all hover:brightness-95 active:translate-y-1 active:shadow-none sm:w-auto"
          >
            Bepul boshlash
          </a>
        </div>

      </motion.div>
    </section>
  );
}
