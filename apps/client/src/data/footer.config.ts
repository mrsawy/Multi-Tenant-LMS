  
 import { Facebook, Youtube, Instagram } from 'lucide-react';

 export type Lang = 'en' | 'ar';
  
  export type SocialLink = {
    icon: React.ElementType;
    href: string;
    label: Record<Lang, string>;
  };
  // const socialLinks: SocialLink[] = [
  //   {
  //     icon: Facebook,
  //     href: 'https://facebook.com',
  //     label: {
  //       en: 'Facebook',
  //       ar: 'فيسبوك',
  //     },
  //   },
  //   {
  //     icon: Youtube,
  //     href: 'https://youtube.com',
  //     label: {
  //       en: 'YouTube',
  //       ar: 'يوتيوب',
  //     },
  //   },
  //   {
  //     icon: Instagram,
  //     href: 'https://instagram.com',
  //     label: {
  //       en: 'Instagram',
  //       ar: 'إنستجرام',
  //     },
  //   },
  // ];

  const pageLinks = [
    {
      href: '/',
      name: {
        en: 'Home',
        ar: 'الرئيسية',
      },
    },
    {
      href: '/courses',
      name: {
        en: 'Courses',
        ar: 'الكورسات',
      },
    },
    {
      href: '/about',
      name: {
        en: 'About',
        ar: 'من نحن',
      },
    },
    {
      href: '/pricing',
      name: {
        en: 'Pricing',
        ar: 'الأسعار',
      },
    },
  ];
  const phoneNumbers = ["201505901635","201505901635"]
  export{  pageLinks ,phoneNumbers}