'use client';

import { Users, Award, Globe, CheckCircle, Briefcase } from 'lucide-react';
import { useTranslations } from 'next-intl';

const AboutStatisticsSection = () => {
  const t = useTranslations('about.statistics');
  
  const stats = [
    {
      icon: Users,
      value: t('items.0.value'),
      label: t('items.0.label'),
      color: 'var(--ant-color-primary)',
    },
    {
      icon: Award,
      value: t('items.1.value'),
      label: t('items.1.label'),
      color: 'var(--ant-color-success)',
    },
    {
      icon: Globe,
      value: t('items.2.value'),
      label: t('items.2.label'),
      color: 'var(--ant-color-info)',
    },
    {
      icon: CheckCircle,
      value: t('items.3.value'),
      label: t('items.3.label'),
      color: 'var(--ant-color-success)',
    },
    // {
    //   icon: Briefcase,
    //   value: t('items.4.value'),
    //   label: t('items.4.label'),
    //   color: 'var(--ant-color-warning)',
    // },
  ];

  return (
    <section className='py-16 md:py-24 bg-background'>
      <div className='container mx-auto px-6 lg:px-8'>
        <div className='flex justify-center md:justify-between flex-wrap gap-4 items-center'>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className='flex flex-col items-center text-center p-6 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-300 hover:shadow-lg w-64 md:w-64 '
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div
                  className='p-4 rounded-full mb-4'
                  style={{
                    backgroundColor: `${stat.color}15`,
                    color: stat.color,
                  }}
                >
                  <Icon className='w-8 h-8' style={{ color: stat.color }} />
                </div>
                <div
                  className='text-3xl md:text-4xl font-bold mb-2'
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className='text-sm md:text-base text-muted-foreground font-medium'>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutStatisticsSection;

