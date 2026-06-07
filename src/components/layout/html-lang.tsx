"use client";

import { useEffect } from "react";
import { localeHtmlLang, type Locale } from "@/i18n/routing";

export function HtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = localeHtmlLang[locale] ?? "zh-CN";
  }, [locale]);
  return null;
}
