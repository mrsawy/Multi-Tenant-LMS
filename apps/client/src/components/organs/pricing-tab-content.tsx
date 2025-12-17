import { Badge } from '@/components/atoms/badge';
import { TabsContent } from '@/components/atoms/tabs';
import { BillingCycle } from '@/lib/types/course/enum/BillingCycle.enum';
import { PricingDetails } from '@/lib/types/course/course.interface';
import { Timer } from 'lucide-react';
import React from 'react';
import { Currency } from '@/lib/data/currency.enum';

interface PricingTabContentProps {
    type: BillingCycle;
    pricing: PricingDetails;
    timeLeft: { days: number; hours: number; minutes: number } | null;
    isSelected: boolean;
    monthlySavings?: number;
    currency:Currency
}

export const PricingTabContent = React.memo<PricingTabContentProps>(({
    type,
    pricing,
    timeLeft,
    isSelected,
    monthlySavings,
    currency
}) => {

    const mainPrice  =  currency == Currency.USD? pricing.priceUSD :pricing.originalPrice 
    const discountedPrice = pricing.discountPercentage
        ? mainPrice * (1 - pricing.discountPercentage / 100)
        : mainPrice;
    const displayPrice = discountedPrice || mainPrice

    const displayedCurrency = currency==Currency.USD?"$":`${currency} `

    return (
        <TabsContent value={type} className="space-y-2">
            <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">
                    {displayedCurrency}{displayPrice.toFixed(2)}
                    {type === BillingCycle.MONTHLY && <span className="text-lg font-normal">/month</span>}
                    {type === BillingCycle.YEARLY && <span className="text-lg font-normal">/year</span>}
                </span>
                {pricing.discountPercentage && (
                    <>
                        <span className="text-lg text-muted-foreground line-through">
                            {displayedCurrency}{pricing.originalPrice.toFixed(2)}
                        </span>
                        <Badge variant="destructive">
                            {pricing.discountPercentage}% off
                        </Badge>
                    </>
                )}
            </div>

            {pricing.discountPercentage && timeLeft && isSelected && (
                <div className="flex items-center gap-2 text-sm text-destructive font-medium">
                    <Timer className="h-4 w-4" />
                    <span>
                        {timeLeft.days > 0 && `${timeLeft.days}d `}
                        {timeLeft.hours}h {timeLeft.minutes}m left at this price!
                    </span>
                </div>
            )}

            {monthlySavings !== undefined && monthlySavings > 0 && (
                <p className="text-sm text-green-600 font-medium">
                    Save {displayedCurrency}{monthlySavings.toFixed(2)} compared to monthly
                </p>
            )}
        </TabsContent>
    );
});

PricingTabContent.displayName = 'PricingTabContent';
export default PricingTabContent;