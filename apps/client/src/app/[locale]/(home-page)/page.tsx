import { routing } from '@/i18n/routing';
import { setRequestLocale } from "next-intl/server";
import HeroSection from "./__sections/hero-section";
import ScrollCards from "./__sections/scroll-cards";
import LogoLoopOrgan from "@/components/organs/LogoLoopOrgan";
import PricingSection from "./__sections/pricing";
import CoursesSection from "./__sections/course-section";
import TeachersSection from "./__sections/teacher-section";
import { findCourses } from "@/lib/actions/courses/getCourses.action";
import ClickSpark from '@/components/ClickSpark';

// Force dynamic rendering - prevents pre-rendering during other page builds
export const dynamic = 'force-dynamic';
// Or use 'auto' if you want Next.js to decide
// export const dynamic = 'auto';

// Keep generateStaticParams for production optimization
// export function generateStaticParams() {
//   return routing.locales.map((locale) => ({ locale }));
// }

interface Props {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{ category?: string }>;
}

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);



  return (
    <div className="relative w-full min-h-screen bg-white dark:bg-black">
      <HeroSection />
      <LogoLoopOrgan />
      <ScrollCards />
      <CoursesSection searchParams={searchParams} />
      <TeachersSection />
      <PricingSection />
    </div>
  );
}