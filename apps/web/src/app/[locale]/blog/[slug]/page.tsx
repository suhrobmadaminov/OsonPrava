import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { SITE_URL } from '@/lib/constants';

interface BlogPostPageProps {
  params: { locale: string; slug: string };
}

const posts: Record<string, { title: string; content: string; date: string; readingTime: string }> = {
  'haydovchilik-guvohnomasi-olish-tartibi': {
    title: "Haydovchilik guvohnomasi olish tartibi — 2024 yil",
    content: `
      <h2>1. Tibbiy ko'rikdan o'tish</h2>
      <p>Haydovchilik guvohnomasini olish uchun birinchi qadam — tibbiy ko'rikdan o'tish. Buning uchun poliklinikaga murojaat qilishingiz kerak.</p>

      <h2>2. Avtomaktabda o'qish</h2>
      <p>Nazariy va amaliy darslarni avtomaktabda o'tishingiz kerak. Nazariy kurs kamida 120 soat, amaliy mashg'ulotlar kamida 56 soatni tashkil etadi.</p>

      <h2>3. Nazariy imtihon topshirish</h2>
      <p>Avtomaktabni tugatgandan so'ng, YHXBda nazariy imtihon topshirasiz. Imtihon 30 ta savoldan iborat, 20 daqiqa vaqt beriladi.</p>

      <h2>4. Amaliy imtihon topshirish</h2>
      <p>Nazariy imtihonni muvaffaqiyatli topshirgandan so'ng, amaliy haydash imtihoniga kirish mumkin.</p>

      <h2>5. Guvohnoma olish</h2>
      <p>Barcha imtihonlarni muvaffaqiyatli topshirgandan so'ng, haydovchilik guvohnomasini olasiz.</p>
    `,
    date: '2024-12-15',
    readingTime: '5 min',
  },
};

export async function generateMetadata({
  params: { locale, slug },
}: BlogPostPageProps): Promise<Metadata> {
  const post = posts[slug];
  const title = post?.title || 'Blog post';

  return {
    title,
    alternates: {
      canonical: `${SITE_URL}/${locale}/blog/${slug}`,
    },
  };
}

export default function BlogPostPage({ params: { locale, slug } }: BlogPostPageProps) {
  const post = posts[slug];

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Maqola topilmadi</h1>
        <Link
          href={`/${locale}/blog`}
          className="mt-4 inline-block text-duo-green hover:underline"
        >
          Blogga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-400">
        <Link href={`/${locale}`} className="hover:text-duo-green">
          OsonPrava
        </Link>
        <ChevronRight size={14} />
        <Link href={`/${locale}/blog`} className="hover:text-duo-green">
          Blog
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-600">{post.title}</span>
      </nav>

      {/* Article */}
      <article>
        <div className="mb-6 flex items-center gap-3 text-sm font-bold text-gray-400">
          <time>{post.date}</time>
          <span className="h-1 w-1 rounded-full bg-gray-300" />
          <span>{post.readingTime}</span>
        </div>
        <h1 className="mb-8 text-3xl font-extrabold text-gray-900 sm:text-4xl">{post.title}</h1>
        <div
          className="prose prose-lg max-w-none prose-headings:font-extrabold prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-duo-green"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}
