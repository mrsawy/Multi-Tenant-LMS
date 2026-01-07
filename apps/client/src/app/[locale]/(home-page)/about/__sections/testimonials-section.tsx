'use client';

import { Card, CardContent } from '@/components/atoms/card';
import { useTranslations } from 'next-intl';

const AboutTestimonialsSection = () => {
  const t = useTranslations('about.testimonials');
  
  const testimonials = [
    {
      quote: t('items.0.quote'),
      author: t('items.0.author'),
      role: t('items.0.role'),
    },
    {
      quote: t('items.1.quote'),
      author: t('items.1.author'),
      role: t('items.1.role'),
    },
    {
      quote: t('items.2.quote'),
      author: t('items.2.author'),
      role: t('items.2.role'),
    },
  ];

  return (
    <section className='py-16 md:py-24 bg-background'>
      <div className='container mx-auto px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold text-foreground mb-4'>
            {t('title')}
          </h2>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            {t('description')}
          </p>
        </div>

        <div className='grid md:grid-cols-3 gap-8'>
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className='bg-muted/50 border-border hover:border-[var(--ant-color-primary)]/30 transition-all duration-300 hover:shadow-lg'
            >
              <CardContent className='p-8'>
                <div className='mb-6'>
                  <div className='w-12 h-12 flex items-center justify-center text-[var(--ant-color-primary)] opacity-30 text-4xl font-serif'>
                    "
                  </div>
                </div>
                <p className='text-muted-foreground text-lg leading-relaxed mb-6'>
                  "{testimonial.quote}"
                </p>
                <div className='border-t border-border pt-6'>
                  <div className='font-semibold text-foreground'>
                    {testimonial.author}
                  </div>
                  <div className='text-sm text-muted-foreground mt-1'>
                    {testimonial.role}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutTestimonialsSection;

