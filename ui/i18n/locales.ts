export const supportedLocales = ['zh-CN', 'en-US'] as const;

export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale: SupportedLocale = 'zh-CN';

export function normalizeLocale(locale?: string | null): SupportedLocale {
  if (!locale) {
    return defaultLocale;
  }

  const normalizedLocale = locale.toLowerCase();

  if (normalizedLocale.startsWith('en')) {
    return 'en-US';
  }

  if (normalizedLocale.startsWith('zh')) {
    return 'zh-CN';
  }

  return defaultLocale;
}
