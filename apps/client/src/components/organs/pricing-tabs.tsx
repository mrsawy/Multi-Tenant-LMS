import { Tabs, TabsList, TabsTrigger } from '@/components/atoms/tabs';
import { BillingCycle } from '@/lib/types/course/enum/BillingCycle.enum';
import { PricingSchema } from '@/lib/types/course/course.interface';
import React, { useMemo } from 'react';
import PricingTabContent from './pricing-tab-content';
import { Currency } from '@/lib/data/currency.enum';

interface PricingTabsProps {
    pricing: PricingSchema;
    selectedPricing: BillingCycle;
    onPricingChange: (pricing: BillingCycle) => void;
    timeLeft: { days: number; hours: number; minutes: number } | null;
    userCurrency:Currency
}

const getPricingLabel = (type: BillingCycle): string => {
    switch (type) {
        case BillingCycle.MONTHLY:
            return "Monthly";
        case BillingCycle.YEARLY:
            return "Yearly";
        case BillingCycle.ONE_TIME:
            return "One-time";
        default:
            return type;
    }
};

export const PricingTabs = React.memo<PricingTabsProps>(({ 
    pricing, 
    selectedPricing, 
    onPricingChange, 
    timeLeft ,
    userCurrency
}) => {
    const monthlySavings = useMemo(() => {
        if (pricing.MONTHLY && pricing.YEARLY) {
            return (pricing.MONTHLY.originalPrice * 12) - pricing.YEARLY.originalPrice;
        }
        return undefined;
    }, [pricing]);

    return (
        <div className="space-y-4">
            <Tabs value={selectedPricing} onValueChange={(value) => onPricingChange(value as BillingCycle)}>
                <TabsList className="grid w-full grid-cols-3">
                    {Object.keys(pricing).map((type) => (
                        <TabsTrigger key={type} value={type} className="text-xs">
                            {getPricingLabel(type as BillingCycle)}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {Object.entries(pricing).map(([type, pricingDetails]) => (
                    <PricingTabContent
                        key={type}
                        type={type as BillingCycle}
                        pricing={pricingDetails}
                        timeLeft={timeLeft}
                        isSelected={type === selectedPricing}
                        monthlySavings={type === BillingCycle.YEARLY ? monthlySavings : undefined}
                        currency={userCurrency==pricingDetails.originalCurrency ?userCurrency :Currency.USD}
                    />
                ))}
            </Tabs>
        </div>
    );
});

PricingTabs.displayName = 'PricingTabs';
export default PricingTabs;