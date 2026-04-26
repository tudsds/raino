import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, type Locale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale: Locale = defaultLocale;

  try {
    const candidate = await requestLocale;
    if (candidate && (locales as readonly string[]).includes(candidate)) {
      locale = candidate as Locale;
    }
  } catch {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
