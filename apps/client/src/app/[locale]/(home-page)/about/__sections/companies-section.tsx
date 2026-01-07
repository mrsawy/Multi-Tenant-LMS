'use client';

import { useTranslations } from 'next-intl';
import { Typography } from '@/components/atoms/typography';
import {
  GraduationCap,
  Briefcase,
  Landmark,
  School,
  Stethoscope,
  Cpu,
  HeartHandshake,
  Store
} from 'lucide-react';

const AboutCompaniesSection = () => {
  const t = useTranslations('about.companies');

  const industries = [
    { name: t('list.0'), icon: GraduationCap },
    { name: t('list.1'), icon: Briefcase },
    { name: t('list.2'), icon: Landmark },
    { name: t('list.3'), icon: School },
    { name: t('list.4'), icon: Stethoscope },
    { name: t('list.5'), icon: Cpu },
    { name: t('list.6'), icon: HeartHandshake },
    { name: t('list.7'), icon: Store },
  ];

  return (
    <section className='py-16 md:py-24 bg-muted/30'>
      <div className='container mx-auto px-6 lg:px-8'>
        <div className='grid lg:grid-cols-2 gap-12 items-center'>
          {/* Left Content */}
          <div className='space-y-4'>
            <Typography
              variant='h2'
              size='3xl'
              weight='bold'
              className='md:text-4xl'
            >
              {t('title')}{' '}
              <span className='text-[var(--ant-color-primary)]'>{t('count')}</span>
            </Typography>
            <Typography
              variant='p'
              size='lg'
              color='muted'
              className='leading-relaxed'
            >
              {t('description')}
            </Typography>
          </div>

          {/* Right Industries Grid */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6 items-center'>
            {industries.map((item, index) => (
              <div
                key={index}
                className='flex flex-col items-center justify-center p-4 bg-background rounded-xl border border-border hover:border-[var(--ant-color-primary)]/50 hover:bg-[var(--ant-color-primary)]/5 transition-all duration-300 hover:shadow-lg group'
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <item.icon className='w-8 h-8 mb-3 text-muted-foreground group-hover:text-[var(--ant-color-primary)] transition-colors' />
                <Typography
                  variant='span'
                  size='sm'
                  color='muted'
                  weight='medium'
                  className='text-center group-hover:text-foreground transition-colors'
                >
                  {item.name}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCompaniesSection;
