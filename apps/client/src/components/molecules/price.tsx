"use client"

import React from 'react';
import { Typography } from '@/components/atoms/typography';
import { Currency } from '@/lib/data/currency.enum';
import { PricingDetails, PricingSchema } from '@/lib/types/course/course.interface';
import { BillingCycle } from '@/lib/types/course/enum/BillingCycle.enum';
import { useTranslations } from 'next-intl';

interface PriceProps {
    isPaid: boolean;
    pricing?: PricingSchema | PricingDetails;
    price?: string; // Simple price string as fallback
    preferredCurrency?: Currency;
    className?: string;
}

/**
 * Formats a number according to currency locale
 * Optimized for EGP currency - no comma separators
 */
const formatPrice = (price: number, currency: Currency): string => {
    // For EGP, format without comma separators
    if (currency === Currency.EGP) {
        return new Intl.NumberFormat('ar-EG', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
            useGrouping: false, // No comma separators
        }).format(price);
    }

    // For other currencies, use standard formatting with grouping
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(price);
};

/**
 * Gets the currency symbol/display for a given currency
 * Optimized for EGP currency - uses Arabic "جنيه" (pound)
 */
const getCurrencyDisplay = (currency: Currency, position: 'before' | 'after' = 'before'): string => {
    switch (currency) {
        case Currency.USD:
            return position === 'before' ? '$' : '';
        case Currency.EGP:
            // For EGP, display "جنيه" after the number
            return position === 'after' ? ' جنيه' : '';
        case Currency.AED:
            return position === 'before' ? 'AED ' : '';
        case Currency.SAR:
            return position === 'before' ? 'SAR ' : '';
        case Currency.KWD:
            return position === 'before' ? 'KWD ' : '';
        case Currency.QAR:
            return position === 'before' ? 'QAR ' : '';
        default:
            return position === 'before' ? `${currency} ` : '';
    }
};

/**
 * Selects the best available pricing from PricingSchema
 * Priority: MONTHLY > YEARLY > ONE_TIME
 */
const selectPricingDetails = (pricing: PricingSchema): PricingDetails | null => {
    if (pricing[BillingCycle.MONTHLY]) {
        return pricing[BillingCycle.MONTHLY];
    }
    if (pricing[BillingCycle.YEARLY]) {
        return pricing[BillingCycle.YEARLY];
    }
    if (pricing[BillingCycle.ONE_TIME]) {
        return pricing[BillingCycle.ONE_TIME];
    }
    return null;
};

export const Price: React.FC<PriceProps> = ({
    isPaid,
    pricing,
    price,
    preferredCurrency = Currency.EGP,
    className = '',
}) => {
    const t = useTranslations('CourseCard');

    if (!isPaid) {
        return (
            <Typography
                variant="span"
                size="sm"
                weight="medium"
                className={`p-0.5 px-1.5 sm:p-1 sm:px-2 rounded-lg sm:rounded-2xl bg-green-600 text-white text-sm sm:text-sm text-start ${className}`}
            >
                {t('free')}
            </Typography>
        );
    }

    // If simple price string is provided, display it directly
    if (price) {
        return (
            <Typography
                variant="span"
                size="2xl"
                weight="bold"
                className={`text-lg sm:text-2xl text-start ${className}`}
            >
                {price}
            </Typography>
        );
    }

    // If no pricing provided, return null
    if (!pricing) {
        return null;
    }

    // Handle PricingSchema - select the best available pricing
    let pricingDetails: PricingDetails | null = null;

    // Check if it's a PricingSchema (has billing cycle keys) vs PricingDetails (has originalPrice)
    const hasBillingCycleKeys = 'MONTHLY' in pricing ||
        'YEARLY' in pricing ||
        'ONE_TIME' in pricing;
    const hasPricingDetailsKeys = 'originalPrice' in pricing && 'originalCurrency' in pricing;

    if (hasBillingCycleKeys && !hasPricingDetailsKeys) {
        // It's a PricingSchema
        pricingDetails = selectPricingDetails(pricing as PricingSchema);
    } else if (hasPricingDetailsKeys) {
        // It's already a PricingDetails
        pricingDetails = pricing as PricingDetails;
    }

    if (!pricingDetails) {
        return null;
    }

    // Determine which price to use based on preferred currency
    const shouldUseUSD = preferredCurrency === Currency.USD;
    const basePrice = shouldUseUSD ? pricingDetails.priceUSD : pricingDetails.originalPrice;

    // Apply discount if available
    const finalPrice = pricingDetails.discountPercentage
        ? basePrice * (1 - pricingDetails.discountPercentage / 100)
        : basePrice;

    // Get the currency to display (use preferredCurrency if USD, otherwise use originalCurrency)
    const displayCurrency = shouldUseUSD ? Currency.USD : pricingDetails.originalCurrency;
    const formattedPrice = formatPrice(finalPrice, displayCurrency);

    // For EGP, display currency after the number with superscript styling (e.g., "1030 جنيه")
    // For other currencies, display before (e.g., "$100" or "AED 100")
    const currencyBefore = getCurrencyDisplay(displayCurrency, 'before');
    const currencyAfter = getCurrencyDisplay(displayCurrency, 'after');
    const isEGP = displayCurrency === Currency.EGP;

    return (
        <Typography
            variant="span"
            size="2xl"
            weight="bold"
            className={`text-lg sm:text-2xl text-start ${className}`}
        >
            {currencyBefore}{formattedPrice}
            {isEGP && currencyAfter && (
                <sup className="text-xs sm:text-sm font-normal leading-none relative top-[-0.2em] mx-1">
                    {currencyAfter.trim()}
                </sup>
            )}
            {!isEGP && currencyAfter}
        </Typography>
    );
};

Price.displayName = 'Price';

export default Price;