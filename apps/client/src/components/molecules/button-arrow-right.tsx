
import { useLocale, useTranslations } from "next-intl";
import { Button } from "../atoms/button"

import { ArrowRightIcon } from "lucide-react"

export function ButtonArrowRight(props: React.ComponentProps<typeof Button>) {
    const t = useTranslations();
    const locale = useLocale();
    const isRTL = locale === 'ar';
    const iconPlacement = 'right';
    return (
        <Button
            variant="default"          // your base style
            effect="expandIcon"
            icon={ArrowRightIcon}
            iconPlacement={iconPlacement}
            {...props}
        />
    )
}