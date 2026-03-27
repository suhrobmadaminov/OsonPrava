import { getRequestConfig } from 'next-intl/server';

export const locales = ['uz', 'ru', 'kr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'uz';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}));
