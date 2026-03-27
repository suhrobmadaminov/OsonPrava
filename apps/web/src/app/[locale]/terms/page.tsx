import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: `${t('terms')} — Oson Prava`,
  };
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-20">
      <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-8">
        Foydalanish shartlari
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-400">
        <p>
          Oson Prava ilovasidan foydalanish orqali siz quyidagi shartlarga
          rozilik bildirasiz.
        </p>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          1. Xizmat tavsifi
        </h2>
        <p>
          Oson Prava — O&apos;zbekistonda haydovchilik guvohnomasi imtihoniga
          tayyorlanish uchun ta&apos;lim platformasi. Ilova 1210+ rasmiy savol,
          ovozli tushuntirishlar, smart testlar va boshqa imkoniyatlarni taqdim etadi.
        </p>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          2. Foydalanuvchi majburiyatlari
        </h2>
        <p>
          Foydalanuvchilar ilovadan faqat qonuniy maqsadlarda foydalanishlari kerak.
          Boshqa foydalanuvchilarga zarar yetkazish, tizimni buzish yoki noqonuniy
          faoliyat taqiqlanadi.
        </p>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          3. Obuna va to&apos;lovlar
        </h2>
        <p>
          Asosiy funksiyalar bepul. Premium obuna qo&apos;shimcha imkoniyatlarni
          ochadi. To&apos;lovlar Click, Payme, Uzum yoki Telegram Stars orqali
          amalga oshiriladi.
        </p>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          4. Javobgarlik cheklovi
        </h2>
        <p>
          Oson Prava imtihon natijalarini kafolatlamaydi. Ilova faqat tayyorlanish
          vositasi sifatida taqdim etiladi.
        </p>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          5. Aloqa
        </h2>
        <p>
          Savollaringiz bo&apos;lsa: @EasyPrava_bot (Telegram)
        </p>
      </div>
    </div>
  );
}
