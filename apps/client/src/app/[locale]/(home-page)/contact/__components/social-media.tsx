'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/atoms/button';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const SocialMedia = () => {
  const t = useTranslations('contact.form');

  const socialLinks = [
    {
      key: 'facebook',
      icon: Facebook,
      label: 'Facebook',
      url: t('social.facebook'),
    },
    {
      key: 'twitter',
      icon: Twitter,
      label: 'Twitter',
      url: t('social.twitter'),
    },
    {
      key: 'instagram',
      icon: Instagram,
      label: 'Instagram',
      url: t('social.instagram'),
    },
    {
      key: 'linkedin',
      icon: Linkedin,
      label: 'LinkedIn',
      url: t('social.linkedin'),
    },
    {
      key: 'youtube',
      icon: Youtube,
      label: 'YouTube',
      url: t('social.youtube'),
    },
  ].filter((link) => link.url);

  return (
    <div className='flex flex-wrap gap-1 sm:gap-3'>
      {socialLinks.map(({ key, icon: Icon, label, url }) => (
        <Button
          key={key}
          variant="outline"
          size='icon'
          asChild
          className='p-2 rounded-lg hover:bg-primary'
          effect="ringHover"
        >
          <a
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            aria-label={label}
          >
            <Icon className='w-5 h-5' />
          </a>
        </Button>
      ))}
    </div>
  );
};

export default SocialMedia;

