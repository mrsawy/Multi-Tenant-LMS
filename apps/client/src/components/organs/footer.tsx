import {Phone } from 'lucide-react';
import Logo from '../atoms/logo';
import { useLocale, useTranslations } from 'next-intl';
import {  pageLinks  ,phoneNumbers } from '@/data/footer.config';
import { Link } from '@/i18n/navigation';
import SocialMedia from '@/app/[locale]/(home-page)/contact/__components/social-media';
import { Button } from '../atoms/button';
type Lang = 'en' | 'ar';

const Footer = () => {
  const t = useTranslations('footer');
  const locale = useLocale() as Lang;

  return (
    <footer className="bg-card border-border mt-16 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-6">
                <Link href="/" className="text-primary hover:text-primary/90 flex cursor-pointer items-center space-x-2 transition-colors">
                <div className="me-2 text-2xl">
                  <Logo />
                </div>
                <span className="hidden font-sans text-xl font-bold sm:inline-block">{t('title')}</span>
              </Link>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">{t('description')}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-foreground mb-4 font-semibold">{t('links')}</h3>
            <ul className="space-y-3">
              {pageLinks.map((link) => (
                <li key={link.name[locale]}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary text-sm transition-colors">
                    {link.name[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-foreground mb-4 font-semibold">{t('contact')}</h3>
            <div className="space-y-3">
             {phoneNumbers.map((link) => (
         <Link key={link} href={`https://wa.me/${link}`}  target="_blank" rel="noopener noreferrer"   className="text-muted-foreground
               hover:text-primary text-sm transition-colors flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{link}</span>
              </Link>
              ))}
             
          
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-foreground mb-4 font-semibold">{t('social')}</h3>
            <div className="flex gap-3">
        
       
              <SocialMedia />


                      <Button
          variant="outline"
          size='icon'
          asChild
          className='p-2 rounded-lg hover:bg-primary'
          effect="ringHover"
        >
    <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok" >
                <svg viewBox="0 0 24 24"  className="h-5 w-5 fill-current">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
        </Button>
                    
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
