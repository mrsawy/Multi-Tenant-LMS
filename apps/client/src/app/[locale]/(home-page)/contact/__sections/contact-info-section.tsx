'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/atoms/card';
import { Mail, Phone, MapPin, Clock, Globe } from 'lucide-react';

const ContactInfoSection = () => {
  const t = useTranslations('Contact.info');
  
  const contactItems = [
    {
      icon: Mail,
      title: t('items.email.title'),
      value: t('items.email.value'),
      link: `mailto:${t('items.email.value')}`,
      color: 'var(--ant-color-primary)',
    },
    {
      icon: Phone,
      title: t('items.phone.title'),
      value: t('items.phone.value'),
      link: `tel:${t('items.phone.value')}`,
      color: 'var(--ant-color-success)',
    },
    {
      icon: MapPin,
      title: t('items.address.title'),
      value: t('items.address.value'),
      link: '#',
      color: 'var(--ant-color-error)',
    },
    {
      icon: Clock,
      title: t('items.hours.title'),
      value: t('items.hours.value'),
      link: '#',
      color: 'var(--ant-color-warning)',
    },
  ];

  return (
    <section className='py-16 md:py-24 bg-muted/30'>
      <div className='container mx-auto px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold text-foreground mb-4'>
            {t('title')}
          </h2>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            {t('description')}
          </p>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {contactItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={index}
                className='bg-background border-border hover:border-[var(--ant-color-primary)]/30 transition-all duration-300 hover:shadow-lg'
              >
                <CardContent className='p-6 text-center'>
                  <div
                    className='w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center'
                    style={{
                      backgroundColor: `${item.color}15`,
                      color: item.color,
                    }}
                  >
                    <Icon className='w-6 h-6' style={{ color: item.color }} />
                  </div>
                  <h3 className='font-semibold text-foreground mb-2'>
                    {item.title}
                  </h3>
                  {item.link !== '#' ? (
                    <a
                      href={item.link}
                      className='text-muted-foreground hover:text-[var(--ant-color-primary)] transition-colors text-sm break-words'
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className='text-muted-foreground text-sm break-words'>
                      {item.value}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ContactInfoSection;


