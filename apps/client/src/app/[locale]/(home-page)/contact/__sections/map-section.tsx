'use client';

import { useTranslations } from 'next-intl';

const ContactMapSection = () => {
  const t = useTranslations('contact.map');
  
  return (
    <section className='py-0 bg-background'>
      <div className='w-full h-[500px] md:h-[600px] relative overflow-hidden'>
        <iframe
          src={t('embedUrl')}
          width='100%'
          height='100%'
          style={{ border: 0 }}
          allowFullScreen
          loading='lazy'
          referrerPolicy='no-referrer-when-downgrade'
          className='absolute inset-0'
          title={t('title')}
        />
      </div>
    </section>
  );
};

export default ContactMapSection;


