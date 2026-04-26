export const locales = ['en', 'zh', 'ja', 'ko'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
