'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_URL, TELEGRAM_BOT } from '@/lib/constants';
import { Star, ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  const locale = useLocale();
  const rotatingWords = ['oson', 'tez', 'bepul', 'qiziqarli'];
  const [currentWord, setCurrentWord] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [rotatingWords.length]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-expressive-primary/5 via-white to-expressive-secondary/5 px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pt-24">
      {/* Background decorations - Expressive */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-gradient-primary/20 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -right-48 top-32 h-[32rem] w-[32rem] rounded-full bg-gradient-secondary/20 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute left-1/2 -translate-x-1/2 bottom-0 h-80 w-80 rounded-full bg-gradient-success/15 blur-3xl"
        />
      </div>

      <div className="relative mx-auto max-w-5xl text-center">
        {/* Free badge - Expressive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full bg-gradient-primary/10 backdrop-blur-md px-6 py-3 text-sm font-bold text-expressive-primary shadow-expressive-sm"
        >
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span>Bepul va reklama yo&apos;q</span>
          <Star className="h-4 w-4 fill-expressive-secondary text-expressive-secondary animate-pulse" />
        </motion.div>

        {/* Main title - Expressive */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl font-black leading-tight text-gray-900 sm:text-6xl lg:text-8xl"
        >
          <span className="text-gray-800">&apos;Prava&apos;ni </span>
          <span className="relative inline-block bg-gradient-primary bg-clip-text text-transparent">
            o&apos;ynab
            <motion.div
              className="absolute -right-2 top-2 h-4 w-1 bg-gradient-primary rounded-full"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
            />
          </span>
          <span className="text-gray-800"> oling!</span>
        </motion.h1>

        {/* Rotating word */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-2xl font-bold text-expressive-secondary sm:text-3xl"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={currentWord}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="inline-block"
            >
              {rotatingWords[currentWord]} usulda!
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* Subtitle - Expressive */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl"
        >
          O&apos;zbekistonda haydovchilik guvohnomasi olish uchun eng qulay test ilovasi.
          Smart o&apos;rganish tizimi, 1210+ savollar, offline rejim.
        </motion.p>

        {/* CTA Buttons - Expressive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <motion.a
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            href={APP_URL}
            className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-primary px-8 py-4 text-lg font-bold text-white shadow-expressive-lg hover:shadow-glow-primary transition-all"
          >
            Hoziroq boshlash
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            href={TELEGRAM_BOT}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#2AABEE] px-8 py-4 text-lg font-bold text-white shadow-expressive hover:shadow-[0_0_30px_rgba(42,171,238,0.5)] transition-all"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
            Telegram orqali kirish
          </motion.a>
        </motion.div>

        {/* App Store Badges - Expressive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          {[
            {
              href: '#',
              icon: (
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.60866 2.00104L3.33571 2.12318C3.12039 2.21936 2.93923 2.37209 2.81296 2.56408C2.68669 2.75607 2.62045 2.97951 2.62045 3.20629V20.7948C2.62045 21.0215 2.68669 21.245 2.81296 21.437C2.93923 21.629 3.12039 21.7817 3.33571 21.8779L3.60971 21.9999C3.75726 22.0657 3.91989 22.0995 4.08419 22.0985C4.41453 22.0965 4.73072 21.9636 4.96558 21.7275L12.4766 14.2164L15.0484 11.6446C15.5173 11.1757 15.7518 10.8232 15.7518 10.4146C15.7518 10.0059 15.5173 9.65343 15.0484 9.18458L12.4766 6.61279L4.96558 0.901746C4.73072 0.665651 4.41453 0.532715 4.08419 0.530762C3.91989 0.529801 3.75726 0.563583 3.60866 2.00104ZM16.8226 12.8196L13.6516 15.9906L20.8897 23.2287C21.1246 23.4648 21.4408 23.5977 21.7711 23.5997C21.9354 23.6007 22.098 23.5669 22.2456 23.5011L22.5196 23.3791C22.9494 23.1871 23.2296 22.7613 23.2296 22.2896V10.1196C23.2296 9.64789 22.9494 9.22214 22.5196 9.0301L22.2456 8.90805C22.098 8.84227 21.9354 8.80849 21.7711 8.80945C21.4408 8.8114 21.1246 8.94434 20.8897 9.18043L16.8226 12.8196Z" />
                </svg>
              ),
              label: 'Google Play',
              className: 'bg-gray-900 hover:bg-gray-800',
            },
            {
              href: '#',
              icon: (
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              ),
              label: 'App Store',
              className: 'bg-gray-900 hover:bg-gray-800',
            },
            {
              href: TELEGRAM_BOT,
              icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              ),
              label: 'Telegram',
              className: 'bg-[#229ED9] hover:bg-[#1f8ec4]',
            },
          ].map((badge, i) => (
            <motion.a
              key={i}
              href={badge.href}
              target={badge.href === TELEGRAM_BOT ? '_blank' : undefined}
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center gap-3 rounded-2xl px-6 py-4 transition-all shadow-expressive-sm hover:shadow-expressive ${badge.className}`}
            >
              {badge.icon}
              <div className="text-left">
                <div className="text-xs font-medium text-gray-300">
                  {i === 2 ? 'Orqali ochish' : i === 0 ? 'GET IT ON' : 'Download on the'}
                </div>
                <div className="text-base font-bold text-white">{badge.label}</div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
