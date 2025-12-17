// app/[locale]/organization-dashboard/my-pages/__components/puck-editor/render.config.tsx

import type { Config } from '@measured/puck';



export const renderConfig: Config = {
  components: {
    HeroSection: {
      render: (props) => {
        const Component = HeroSection().render;
        return <Component {...props} />;
      },
    },
    HeroWithVideo: {
      render: (props) => {
        const Component = HeroWithVideo().render;
        return <Component {...props} />;
      },
    },
    FeatureGrid: {
      render: (props) => {
        const Component = FeaturedGridSection().render;
        return <Component {...props} />;
      },
    },
    CourseShowcase: {
      render: (props) => {
        const Component = CourseShowcase().render;
        return <Component {...props} />;
      },
    },
    StatsSection: {
      render: (props) => {
        const Component = StatsSection().render;
        return <Component {...props} />;
      },
    },
    TestimonialSection: {
      render: (props) => {
        const Component = TestimonialSection().render;
        return <Component {...props} />;
      },
    },
    CTASection: {
      render: (props) => {
        const Component = CTASection().render;
        return <Component {...props} />;
      },
    },
    PricingSection: {
      render: (props) => {
        const Component = PricingSection().render;
        return <Component {...props} />;
      },
    },
    FAQSection: {
      render: (props) => {
        const Component = FAQSection().render;
        return <Component {...props} />;
      },
    },
    NewsletterSection: {
      render: (props) => {
        const Component = NewsLetterSection().render;
        return <Component {...props} />;
      },
    },
    Footer: {
      render: (props) => {
        const Component = FooterSection().render;
        return <Component {...props} />;
      },
    },
    InstructorSection: {
      render: (props) => {
        const Component = InstructorSection().render;
        return <Component {...props} />;
      },
    },
    BlogSection: {
      render: (props) => {
        const Component = BlogSection().render;
        return <Component {...props} />;
      },
    },
  },
};

export default renderConfig;