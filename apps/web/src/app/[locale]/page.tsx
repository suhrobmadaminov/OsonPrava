import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/constants';
import { HeroSection } from '@/components/home/HeroSection';
import { StatsSection } from '@/components/home/StatsSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { FAQ } from '@/components/home/FAQ';
import { CTA } from '@/components/home/CTA';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: SITE_URL,
      siteName: 'OsonPrava',
      locale: locale === 'uz' ? 'uz_UZ' : locale === 'ru' ? 'ru_RU' : 'uz_UZ',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        uz: `${SITE_URL}/uz`,
        ru: `${SITE_URL}/ru`,
        kr: `${SITE_URL}/kr`,
      },
    },
  };
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorks />
      <FAQ />
      <CTA />
    </>
  );
}
