import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: `${t('privacy')} — Oson Prava`,
  };
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-20">
      <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-8">
        Maxfiylik siyosati
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-400">
        <p>
          Oson Prava ilovasiga xush kelibsiz. Biz foydalanuvchilarimizning maxfiyligini
          jiddiy qabul qilamiz. Ushbu maxfiylik siyosati bizning ma&apos;lumotlaringizni
          qanday yig&apos;ishimiz, ishlatishimiz va himoya qilishimiz haqida tushuntiradi.
        </p>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          1. Qanday ma&apos;lumotlar yig&apos;iladi
        </h2>
        <p>
          Biz faqat ilovadan foydalanish uchun zarur bo&apos;lgan ma&apos;lumotlarni
          yig&apos;amiz: Telegram profil ma&apos;lumotlari (ism, username, avatar),
          test natijalari va o&apos;rganish statistikasi.
        </p>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          2. Ma&apos;lumotlardan foydalanish
        </h2>
        <p>
          Yig&apos;ilgan ma&apos;lumotlar faqat quyidagi maqsadlarda ishlatiladi:
          shaxsiy o&apos;quv tajribasini yaxshilash, spaced repetition tizimini
          boshqarish, reyting va yutuqlarni ko&apos;rsatish.
        </p>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          3. Ma&apos;lumotlar xavfsizligi
        </h2>
        <p>
          Barcha ma&apos;lumotlar shifrlangan holda saqlanadi. Biz foydalanuvchi
          ma&apos;lumotlarini uchinchi tomonlarga sotmaymiz yoki bermaymiz.
        </p>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          4. Aloqa
        </h2>
        <p>
          Maxfiylik siyosati bo&apos;yicha savollaringiz bo&apos;lsa, bizga Telegram
          orqali murojaat qiling: @OsonPravaBot
        </p>
      </div>
    </div>
  );
}
