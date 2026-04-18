'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Menu, X } from 'lucide-react';
import { APP_URL } from '@/lib/constants';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/blog`, label: t('blog') },
    { href: `/${locale}/signs`, label: t('signs') },
  ];

  return (
    <header className="sticky top-0 z-50 border-b-2 border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-duo-green">
            <span className="text-xl font-extrabold text-white">E</span>
          </div>
          <span className="text-xl font-extrabold text-gray-900">
            Easy<span className="text-duo-green">Prava</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-bold uppercase tracking-wide text-gray-500 transition-colors hover:text-duo-green"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <a
            href={`${APP_URL}/login`}
            className="rounded-xl border-2 border-duo-green px-5 py-2 text-sm font-bold text-duo-green transition-all hover:bg-duo-green/10"
          >
            {t('login')}
          </a>
          <a
            href={`${APP_URL}/register`}
            className="rounded-2xl bg-duo-green px-5 py-2 text-sm font-bold text-white shadow-[0_3px_0_0_#4CAD01] transition-all hover:brightness-110 active:translate-y-0.5 active:shadow-none"
          >
            {t('register')}
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-2 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wide text-gray-600 transition-colors hover:bg-gray-50 hover:text-duo-green"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 pt-4 mt-2 flex flex-col gap-3">
              <a
                href={`${APP_URL}/login`}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl border-2 border-duo-green px-4 py-3 text-center text-sm font-bold text-duo-green transition-all hover:bg-duo-green/10"
              >
                {t('login')}
              </a>
              <a
                href={`${APP_URL}/register`}
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl bg-duo-green px-4 py-3 text-center text-sm font-bold text-white shadow-[0_3px_0_0_#4CAD01] transition-all hover:brightness-110"
              >
                {t('register')}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
