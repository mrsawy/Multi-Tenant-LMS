import { Card, CardContent } from '@/components/atoms/card';
import { Separator } from '@/components/atoms/separator';
import { ICourse } from '@/lib/types/course/course.interface';
import { BillingCycle } from '@/lib/types/course/enum/BillingCycle.enum';
import { IUser } from '@/lib/types/user/user.interface';
import { IWallet } from '@/lib/types/wallet/IWallet';
import React, { useCallback } from 'react';
import VideoPreview from './video-preview';
import WalletBalanceAlert from './wallet-balance-alert';
import FreePricing from './free-pricing';
import PricingTabs from './pricing-tabs';
import EnrollmentButtons from './enrollment-buttons';
import CourseIncludes from './course-includes';
import CourseMetadata from './course-meta-data';
import { Currency } from '@/lib/data/currency.enum';

interface CourseEnrollmentCardProps {
    user?: IUser;
    course: ICourse;
    wallet: IWallet;
    selectedPricing: BillingCycle;
    onPricingChange: (pricing: BillingCycle) => void;
    onEnroll: () => void;
    timeLeft: { days: number; hours: number; minutes: number } | null;
}

export const CourseEnrollmentCard = React.memo<CourseEnrollmentCardProps>(({
    user,
    course,
    wallet,
    selectedPricing,
    onPricingChange,
    onEnroll,
    timeLeft
}) => {
    const handleEnroll = useCallback(() => {
        onEnroll();
    }, [onEnroll]);

    return (
        <Card className="sticky top-8">
            <CardContent className="p-0">
                <VideoPreview />

                <div className="p-6 space-y-4">
                    {user && course.isPaid && (
                        <WalletBalanceAlert balance={wallet.balance} currency={wallet.currency} />
                    )}

                    {!course.isPaid ? (
                        <FreePricing />
                    ) : (
                        <PricingTabs
                            pricing={course.pricing}
                            selectedPricing={selectedPricing}
                            onPricingChange={onPricingChange}
                            timeLeft={timeLeft}
                            userCurrency={user?.preferredCurrency || Currency.EGP}
                        />
                    )}

                    <EnrollmentButtons
                        isPaid={course.isPaid}
                        selectedPricing={selectedPricing}
                        onEnroll={handleEnroll}
                    />

                    <p className="text-center text-sm text-muted-foreground">
                        30-day money-back guarantee
                    </p>

                    <CourseIncludes learningObjectives={course.learningObjectives} />
                    <CourseMetadata language={course.language} updatedAt={course.updatedAt} />
                </div>
            </CardContent>
        </Card>
    );
});

CourseEnrollmentCard.displayName = 'CourseEnrollmentCard';