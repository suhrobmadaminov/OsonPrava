'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { TELEGRAM_BOT } from '@/lib/constants';

export function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const locale = useLocale();

  return (
    <footer className="border-t-2 border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-duo-green">
                <span className="text-xl font-extrabold text-white">O</span>
              </div>
              <span className="text-xl font-extrabold text-gray-900">
                Oson<span className="text-duo-green">Prava</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-500">{t('description')}</p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
              {t('links')}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href={`/${locale}/blog`}
                  className="text-sm text-gray-500 transition-colors hover:text-duo-green"
                >
                  {nav('blog')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/signs`}
                  className="text-sm text-gray-500 transition-colors hover:text-duo-green"
                >
                  {nav('signs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
              {t('legal')}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className="text-sm text-gray-500 transition-colors hover:text-duo-green"
                >
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/terms`}
                  className="text-sm text-gray-500 transition-colors hover:text-duo-green"
                >
                  {t('terms')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
              {t('social')}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={TELEGRAM_BOT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-duo-blue"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                  {t('telegram')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} OsonPrava. {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
