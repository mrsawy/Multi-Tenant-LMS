import { Button } from "@/components/ui/button";
// import { useTranslations } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";


export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { locale } = await params;


  setRequestLocale(locale);

  console.log({ locale })

  const t = await getTranslations('HomePage');

  return (
    <div className="flex justify-center items-center h-full min-h-screen">
      <Button>{t('title')}</Button>
    </div>
  );
}
