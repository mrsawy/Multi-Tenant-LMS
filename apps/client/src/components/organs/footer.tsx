import { Facebook, Youtube, Instagram, Phone } from 'lucide-react';
import Logo from '../atoms/logo';
import { useLocale, useTranslations } from 'next-intl';
type Lang = 'en' | 'ar';

type SocialLink = {
  icon: React.ElementType;
  href: string;
  label: Record<Lang, string>;
};

const Footer = () => {
  const t = useTranslations('footer');
  const locale = useLocale() as Lang;
  const socialLinks: SocialLink[] = [
    {
      icon: Facebook,
      href: 'https://facebook.com',
      label: {
        en: 'Facebook',
        ar: 'فيسبوك',
      },
    },
    {
      icon: Youtube,
      href: 'https://youtube.com',
      label: {
        en: 'YouTube',
        ar: 'يوتيوب',
      },
    },
    {
      icon: Instagram,
      href: 'https://instagram.com',
      label: {
        en: 'Instagram',
        ar: 'إنستجرام',
      },
    },
  ];

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

  return (
    <footer dir="rtl" className="bg-card border-border mt-16 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <button className="text-primary hover:text-primary/90 flex cursor-pointer items-center space-x-2 transition-colors">
                <div className="me-2 text-2xl">
                  <Logo />
                </div>
                <span className="hidden font-sans text-xl font-bold sm:inline-block">{t('title')}</span>
              </button>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">{t('description')}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-foreground mb-4 font-semibold">{t('links')}</h3>
            <ul className="space-y-3">
              {pageLinks.map((link) => (
                <li key={link.name[locale]}>
                  <a href={link.href} className="text-muted-foreground hover:text-primary text-sm transition-colors">
                    {link.name[locale]}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-foreground mb-4 font-semibold">{t('contact')}</h3>
            <div className="space-y-3">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                <span>01024466325</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                <span>01024466325</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-foreground mb-4 font-semibold">{t('social')}</h3>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a key={social.href} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label[`${locale}`]} className="bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
              {/* TikTok (custom SVG since lucide doesn't have it) */}
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-border mt-8 border-t pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
