import { Button } from "@/components/atoms/button";
// import { useTranslations } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getTranslations, setRequestLocale } from "next-intl/server";
import NavBar from "./__sections/nav-bar";
import HeroSection from "./__sections/hero-section";
import ScrollCards from "./__sections/scroll-cards";
import LogoLoopOrgan from "@/components/organs/LogoLoopOrgan";
import PricingSection from "./__sections/pricing";
import CoursesSection from "./__sections/course-section";
import TeachersSection from "./__sections/teacher-section";
import { findCourses } from "@/lib/actions/courses/getCourses.action";



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


  const courses = await findCourses()


  return (
    <div className="relative w-full min-h-screen ">

      <HeroSection />
      <LogoLoopOrgan />
      <ScrollCards />
      <TeachersSection />
      <CoursesSection courses={courses} />
      <PricingSection />

    </div>
  );
}
