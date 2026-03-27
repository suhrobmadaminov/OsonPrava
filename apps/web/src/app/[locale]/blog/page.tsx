import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { BlogList } from '@/components/blog/BlogList';
import { SITE_URL } from '@/lib/constants';

const staticPosts = [
  {
    slug: 'haydovchilik-guvohnomasi-olish-tartibi',
    title: "Haydovchilik guvohnomasi olish tartibi — 2024 yil",
    excerpt:
      "O'zbekistonda haydovchilik guvohnomasini qanday olish mumkin? To'liq qo'llanma.",
    image: '/images/blog/license-guide.jpg',
    date: '2024-12-15',
    readingTime: '5 min',
  },
  {
    slug: 'yol-belgilari-turlari',
    title: "Yo'l belgilarining turlari va ma'nolari",
    excerpt:
      "Barcha yo'l belgilari haqida to'liq ma'lumot. Ogohlantiruvchi, taqiqlovchi, axborot belgilari.",
    image: '/images/blog/road-signs.jpg',
    date: '2024-12-10',
    readingTime: '8 min',
  },
  {
    slug: 'imtihon-sirlari',
    title: "Nazariy imtihonni birinchi marta topshirish sirlari",
    excerpt:
      "Imtihonni birinchi urinishda topshirish uchun amaliy maslahatlar va tavsiyalar.",
    image: '/images/blog/exam-tips.jpg',
    date: '2024-12-05',
    readingTime: '6 min',
  },
  {
    slug: 'birinchi-yordam',
    title: "Birinchi tibbiy yordam ko'rsatish qoidalari",
    excerpt:
      "Imtihonda beriladigan birinchi yordam savollari va ularning to'g'ri javoblari.",
    image: '/images/blog/first-aid.jpg',
    date: '2024-11-28',
    readingTime: '7 min',
  },
  {
    slug: 'svetofor-ishoralari',
    title: "Svetofor ishoralari va ularning ma'nolari",
    excerpt:
      "Svetoforning barcha ishoralari, qo'shimcha bo'limlar va regulirovkachi ishoralari.",
    image: '/images/blog/traffic-lights.jpg',
    date: '2024-11-20',
    readingTime: '4 min',
  },
  {
    slug: 'oktagon-rejimi',
    title: "OsonPrava Oktagon 1v1 — do'stlar bilan bellashing",
    excerpt:
      "Yangi Oktagon rejimida do'stlaringiz bilan real vaqtda bellashing va o'z bilimingizni sinab ko'ring.",
    image: '/images/blog/octagon.jpg',
    date: '2024-11-15',
    readingTime: '3 min',
  },
];

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'nav' });

  return {
    title: t('blog'),
    description: "OsonPrava blog — haydovchilik guvohnomasi, yo'l qoidalari va imtihonga tayyorgarlik haqida maqolalar.",
    alternates: {
      canonical: `${SITE_URL}/${locale}/blog`,
    },
  };
}

export default function BlogPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-extrabold text-gray-900 sm:text-4xl">Blog</h1>
      <BlogList posts={staticPosts} locale={locale} />
    </div>
  );
}
