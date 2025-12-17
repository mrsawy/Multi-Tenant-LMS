'use client';

import { Puck } from '@measured/puck';
import '@measured/puck/puck.css';
import { HeroSection, HeroWithVideo } from '../__sections/hero.section';
import FeaturedGridSection from '../__sections/featuredGrid.sections';
import FeatureCardsSection from '../__sections/featureCards.section';
import CourseShowcase from '../__sections/courseShowcase.section';
import StatsSection from '../__sections/stats.section';
import TestimonialSection from '../__sections/testimonial.section';
import CTASection from '../__sections/cta.section';
import PricingSection from '../__sections/pricing.section';
import FAQSection from '../__sections/faq.section';
import NewsLetterSection from '../__sections/newsLetter.section';
import FooterSection from '../__sections/footer.section';
import InstructorSection from '../__sections/instructor.section';
import BlogSection from '../__sections/blog.section';
import TimelineSection from '../__sections/timeline.section';
import TeamSection from '../__sections/team.section';
import LogoCloudSection from '../__sections/logoCloud.section';
import ButtonComponent from '../__sections/button.section';
import HeaderSection from '../__sections/header.section';
import { ImageSection } from '../__sections/image.section';
import type { Config } from '@measured/puck';
import { createNatsRequest } from '@/lib/utils/createNatsRequest';
import { usePathname } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import useGeneralStore from '@/lib/store/generalStore';
import { toast } from 'react-toastify';

export const config: Config = {
  categories: {
    Header: {
      components: ['Header'],
    },
    Hero: {
      components: ['HeroSection', 'HeroWithVideo'],
    },
    Features: {
      components: ['FeatureGrid', 'FeatureCards', 'StatsSection'],
    },
    Courses: {
      components: ['CourseShowcase', 'InstructorSection'],
    },
    Content: {
      components: ['BlogSection', 'FAQSection', 'Timeline', 'Image'],
    },
    // ...
  },

  components: {
    Header: HeaderSection(),
    HeroSection: HeroSection(),
    HeroWithVideo: HeroWithVideo(),
    FeatureGrid: FeaturedGridSection(),
    FeatureCards: FeatureCardsSection(),
    CourseShowcase: CourseShowcase(),
    StatsSection: StatsSection(),
    TestimonialSection: TestimonialSection(),
    CTASection: CTASection(),
    FAQSection: FAQSection(),
    Footer: FooterSection(),
    InstructorSection: InstructorSection(),
    BlogSection: BlogSection(),
    Timeline: TimelineSection(),
    TeamSection: TeamSection(),
    LogoCloud: LogoCloudSection(),
    Image: ImageSection(),
  },
};

const defaultInitialData = {
  content: [],
  root: { props: { title: 'My Landing Page' } },
};

export default function PuckEditor({
  initialData = defaultInitialData,
}: {
  initialData?: any;
}) {
  const params = useParams();
  const slug = params.slug;

  const save = async (pageData: any) => {
    try {
      useGeneralStore.setState({ generalIsLoading: true });
      const response = await createNatsRequest('pages.updatePage', {
        slug,
        pageData,
      });
      toast.success('Page Updated Successfully!');
      return response;
    } catch (error: any) {
      toast.error(error.message || 'Error Updating The Page');
    } finally {
      useGeneralStore.setState({ generalIsLoading: false });
    }
  };
  return <Puck config={config} data={initialData} onPublish={save} />;
}
