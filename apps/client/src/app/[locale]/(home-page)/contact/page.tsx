import { routing } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import ContactFormSection from './__sections/contact-form-section';
import ContactInfoSection from './__sections/contact-info-section';
import ContactMapSection from './__sections/map-section';

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{
        locale: string;
    }>;
}

export default async function ContactPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <div className='relative w-full min-h-screen bg-background'>
            <ContactFormSection />
            {/* <ContactInfoSection /> */}
            <ContactMapSection />
        </div>
    );
}

