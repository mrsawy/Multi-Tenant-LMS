'use client';

import Image from 'next/image';
import { Button } from '@/components/atoms/button';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

const AboutGallerySection = () => {
  const t = useTranslations('about.gallery');
  
  const galleryImages = [
    { src: '/images/5272908.jpg', alt: t('images.0.alt') },
    { src: '/images/5784396.jpg', alt: t('images.1.alt') },
    { src: '/images/6521706.jpg', alt: t('images.2.alt') },
    { src: '/images/6523102.jpg', alt: t('images.3.alt') },
    { src: '/images/9193641.jpg', alt: t('images.4.alt') },
    { src: '/images/9216791.jpg', alt: t('images.5.alt') },
  ];

  return (
    <section className='py-16 md:py-24 bg-muted/30'>
      <div className='container mx-auto px-6 lg:px-8'>
        <div className='grid lg:grid-cols-2 gap-12 items-start'>
          {/* Left Content */}
          <div className='space-y-6'>
            <div className='inline-block px-4 py-2 rounded-full bg-[var(--ant-color-primary)]/10 text-[var(--ant-color-primary)] text-sm font-semibold uppercase tracking-wider'>
              {t('badge')}
            </div>
            <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight'>
              {t('title')}
            </h2>
            <p className='text-lg text-muted-foreground leading-relaxed'>
              {t('description1')}
            </p>
            <p className='text-lg text-muted-foreground leading-relaxed'>
              {t('description2')}
            </p>
            <Button
              size='lg'
              className='bg-[var(--ant-color-primary)] hover:bg-[var(--ant-color-primary-hover)] text-white mt-4'
            >
              {t('cta')}
              <ArrowRight className='w-4 h-4' />
            </Button>
          </div>

          {/* Right Gallery Grid */}
          <div className='grid grid-cols-2 gap-4'>
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className='relative h-[200px] md:h-[250px] rounded-xl overflow-hidden group cursor-pointer'
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className='object-cover transition-transform duration-300 group-hover:scale-110'
                  sizes='(max-width: 768px) 50vw, 25vw'
                />
                <div className='absolute inset-0 bg-[var(--ant-color-primary)]/0 group-hover:bg-[var(--ant-color-primary)]/20 transition-colors duration-300' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutGallerySection;

