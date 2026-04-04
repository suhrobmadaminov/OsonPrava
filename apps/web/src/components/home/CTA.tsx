'use client';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { APP_URL, TELEGRAM_BOT } from '@/lib/constants';
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
          10,000+ foydalanuvchilar EasyPrava yordamida imtihondan muvaffaqiyatli o'tishmoqda.
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
            href={`/${locale}/auth/register`}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-8 py-4 text-lg font-bold text-duo-green shadow-[0_4px_0_0_#e5e7eb] transition-all hover:brightness-95 active:translate-y-1 active:shadow-none sm:w-auto"
          >
            Bepul boshlash
          </a>
          <a
            href={TELEGRAM_BOT}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white/20 active:translate-y-1 sm:w-auto"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
            Telegram Bot
          </a>
        </div>

        {/* No registration note */}
        <p className="mx-auto mt-6 text-sm font-semibold text-white/70">
          ✓ Telegram orqali bir marta bosish bilan kirish mumkin
        </p>
      </motion.div>
    </section>
  );
}
