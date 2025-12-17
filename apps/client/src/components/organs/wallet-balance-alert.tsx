import { Alert, AlertDescription } from '@/components/atoms/alert';
import { Currency } from '@/lib/data/currency.enum';
import { Wallet } from 'lucide-react';
import React from 'react';

interface WalletBalanceAlertProps {
    balance: number;
    currency:Currency
}

export const WalletBalanceAlert = React.memo<WalletBalanceAlertProps>(({ balance, currency }) => {
    return (
        <Alert>
            <Wallet className="h-4 w-4" />
            <AlertDescription className="flex justify-between items-center">
                <span>Wallet Balance:</span>
                <span className="font-bold">{currency}{" "}{balance.toFixed(2)}</span>
            </AlertDescription>
        </Alert>
    );
});
WalletBalanceAlert.displayName = 'WalletBalanceAlert';

export default WalletBalanceAlert;