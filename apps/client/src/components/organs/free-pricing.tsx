import { Badge } from '@/components/atoms/badge';
import React from 'react';

export const FreePricing = React.memo(() => {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-green-600">Free</span>
                <Badge variant="outline" className="bg-green-100 text-green-800">No cost</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
                Get lifetime access at no cost!
            </p>
        </div>
    );
});

FreePricing.displayName = 'FreePricing';
export default FreePricing;