import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["zh", "en"],
  defaultLocale: "zh",
  localePrefix: "never",
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];

export const localeHtmlLang: Record<Locale, string> = {
  zh: "zh-CN",
  en: "en",
};
