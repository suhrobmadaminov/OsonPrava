import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: `${t('signs')} — Oson Prava`,
    description: "O'zbekistondagi barcha yo'l belgilari — ogohlantiruvchi, taqiqlovchi, axborot va boshqalar.",
  };
}

const signCategories = [
  {
    slug: 'warning',
    nameUz: 'Ogohlantiruvchi belgilar',
    icon: '⚠️',
    color: 'bg-duo-yellow/10 border-duo-yellow/30',
    count: 48,
  },
  {
    slug: 'priority',
    nameUz: 'Ustunlik belgilari',
    icon: '🔺',
    color: 'bg-duo-red/10 border-duo-red/30',
    count: 13,
  },
  {
    slug: 'prohibition',
    nameUz: "Taqiqlovchi belgilar",
    icon: '🚫',
    color: 'bg-duo-red/10 border-duo-red/30',
    count: 36,
  },
  {
    slug: 'mandatory',
    nameUz: 'Buyuruvchi belgilar',
    icon: '🔵',
    color: 'bg-duo-blue/10 border-duo-blue/30',
    count: 15,
  },
  {
    slug: 'special',
    nameUz: 'Maxsus belgilar',
    icon: '🟦',
    color: 'bg-duo-purple/10 border-duo-purple/30',
    count: 24,
  },
  {
    slug: 'information',
    nameUz: 'Axborot belgilari',
    icon: 'ℹ️',
    color: 'bg-duo-blue/10 border-duo-blue/30',
    count: 32,
  },
  {
    slug: 'service',
    nameUz: 'Servis belgilari',
    icon: '🅿️',
    color: 'bg-duo-green/10 border-duo-green/30',
    count: 12,
  },
  {
    slug: 'additional',
    nameUz: "Qo'shimcha belgilar",
    icon: '📋',
    color: 'bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600',
    count: 20,
  },
];

export default function SignsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <div className="max-w-6xl mx-auto px-5 py-20">
      <div className="text-center mb-16">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white">
          Yo&apos;l belgilari
        </h1>
        <p className="mt-4 text-lg font-medium text-gray-500 dark:text-gray-400">
          O&apos;zbekistondagi barcha yo&apos;l belgilarini o&apos;rganing
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {signCategories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${locale}/signs/${cat.slug}`}
            className={`block p-6 rounded-2xl border ${cat.color} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
          >
            <div className="text-4xl mb-3">{cat.icon}</div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {cat.nameUz}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {cat.count} ta belgi
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
