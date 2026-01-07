'use client';

import Image from 'next/image';
import { Button } from '@/components/atoms/button';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/atoms/badge';
import { Typography } from '@/components/atoms/typography';
import { useTranslations } from 'next-intl';
const aboutImage = '/images/home-section-cards/card3/3.jpg';

const AboutHeroSection = () => {
  const t = useTranslations('about.hero');

  return (
    <section className='relative  py-10 md:py-24 overflow-hidden bg-gradient-to-b from-background to-muted/20'>
      <div className='container mx-auto  lg:px-8'>
        <div className='grid lg:grid-cols-2 gap-12 items-center'>
          {/* Left Content */}
          <div className='space-y-6 px-6'>
            <div className='text-muted-foreground text-lg font-medium text-center sm:text-start'>
              <Badge
                variant="default"
                className="mb-6 bg-gradient-to-r from-primary/30 to-primary/10 font-bold rounded-full border-none py-2 px-9 text-primary "
              >
                <div className="rounded-full bg-gradient-to-r from-primary/40 to-primary/50 size-2 hover:bg-primary me-3"></div>
                {t("numberOneMultiTenantSolution")}
              </Badge>
            </div>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-center sm:text-start'>
              {t('title')}
            </h1>
            <Typography
              variant='p'
              size='lg'
              color='muted'
              className='leading-relaxed max-w-xl'
            >
              {t('description')}
            </Typography>
            <div className='flex gap-4 pt-4 justify-center sm:justify-start'>
              <Button size='lg' variant='default' effect='expandIcon' icon={ArrowRight}>
                {t('learnMore')}
              </Button>
              <Button size='lg' variant='outline'>
                {t('contactUs')}
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div className='relative ml-12  h-[300px] md:h-[500px] rounded-bl-2xl rounded-tl-2xl sm:rounded-2xl overflow-hidden shadow-2xl'>
            <Image
              src={aboutImage}
              alt='Team collaboration'
              fill
              className='object-cover'
              sizes='(max-width: 768px) 100vw, 50vw'
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHeroSection;

