import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppShell } from "@/components/layout/app-shell";
import { Footer } from "@/components/layout/footer";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { StructuredData } from "@/lib/seo/structured-data";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/metadata";

import { routing, type Locale } from "@/i18n/routing";
import { HtmlLang } from "@/components/layout/html-lang";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <HtmlLang locale={locale as Locale} />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <NavigationProgress />
        <StructuredData data={[organizationJsonLd(), websiteJsonLd()]} />
        <AppShell>{children}</AppShell>
        <Footer />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
