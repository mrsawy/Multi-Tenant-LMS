import { Button } from '@/components/atoms/button';
import { BillingCycle } from '@/lib/types/course/enum/BillingCycle.enum';
import React from 'react';

interface EnrollmentButtonsProps {
    isPaid: boolean;
    selectedPricing: BillingCycle;
    onEnroll: () => void;
}

const getButtonText = (isPaid: boolean, selectedPricing: BillingCycle): string => {
    if (!isPaid) return "Enroll for Free";

    switch (selectedPricing) {
        case BillingCycle.MONTHLY:
            return "Start Monthly Subscription";
        case BillingCycle.YEARLY:
            return "Start Yearly Subscription";
        case BillingCycle.ONE_TIME:
            return "Enroll Now";
        default:
            return "Enroll Now";
    }
};

export const EnrollmentButtons = React.memo<EnrollmentButtonsProps>(({ 
    isPaid, 
    selectedPricing, 
    onEnroll 
}) => {
    return (
        <div className="space-y-3">
            <Button size="lg" className="w-full" onClick={onEnroll}>
                {getButtonText(isPaid, selectedPricing)}
            </Button>
            <Button variant="outline" size="lg" className="w-full">
                Add to Wishlist
            </Button>
        </div>
    );
});

EnrollmentButtons.displayName = 'EnrollmentButtons';
export default EnrollmentButtons;