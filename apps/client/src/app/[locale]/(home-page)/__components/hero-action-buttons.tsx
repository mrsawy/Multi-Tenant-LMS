'use client';

import { Button } from '@/components/atoms/button';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Download, UserPlus } from 'lucide-react';

const HeroActionButtons: React.FC = () => {
    const t = useTranslations('Hero');
    const locale = useLocale();
    const isRTL = locale === 'ar';
    const iconPlacement = isRTL ? 'left' : 'right';

    return (
        <ul className="mb-10 flex flex-wrap items-center justify-center gap-4 md:w-9/12 mx-auto">
            <li className="flex-1 min-w-[200px]">
                <Link
                    href="/download"
                    className="inline-flex items-center justify-center rounded-md px-2 py-[14px] text-center text-base font-medium text-dark shadow-1 transition duration-300 ease-in-out hover:bg-gray-2 w-full"
                >
                    <Button
                        className="default w-full md:text-lg rounded-xl px-2"
                        effect="expandIcon"
                        icon={Download}
                        iconPlacement={"left"}
                    >
                        {t('downloadStudentsApplicationNow')}
                    </Button>
                </Link>
            </li>
            <li className="flex-1 min-w-[200px]">
                <Link
                    href="/register"
                    className="flex items-center gap-4 rounded-md px-2 py-[14px] text-base font-medium transition duration-300 ease-in-out hover:text-dark w-full"
                >
                    <Button
                        className="outline border dark:text-black text-white w-full md:text-lg rounded-xl px-2"
                        effect="expandIcon"
                        icon={UserPlus}
                        iconPlacement={"left"}
                    >
                        {t('createNewAccountNow')}
                    </Button>
                </Link>
            </li>
        </ul>
    );
};

export default HeroActionButtons;

