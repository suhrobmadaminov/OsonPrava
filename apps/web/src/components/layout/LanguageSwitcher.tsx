'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, Globe } from 'lucide-react';
import { locales } from '@/i18n/config';

const localeLabels: Record<string, string> = {
  uz: "O'zbek",
  ru: 'Русский',
  kr: 'Ўзбек',
};

const localeShort: Record<string, string> = {
  uz: 'UZ',
  ru: 'RU',
  kr: 'ЎЗ',
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function switchLocale(newLocale: string) {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-xl border-2 border-gray-200 px-3 py-2 text-sm font-bold text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
      >
        <Globe size={16} />
        <span>{localeShort[locale]}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-lg">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`flex w-full items-center px-4 py-3 text-left text-sm font-bold transition-colors hover:bg-gray-50 ${
                loc === locale ? 'bg-duo-green/10 text-duo-green' : 'text-gray-600'
              }`}
            >
              {localeLabels[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
