'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

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
                <span className="text-xl font-extrabold text-white">E</span>
              </div>
              <span className="text-xl font-extrabold text-gray-900">
                Easy<span className="text-duo-green">Prava</span>
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
