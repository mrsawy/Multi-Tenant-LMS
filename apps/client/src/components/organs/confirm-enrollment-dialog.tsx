import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { Separator } from '@/components/atoms/separator';
import { Button } from '@/components/atoms/button';
import { BillingCycle } from '@/lib/types/course/enum/BillingCycle.enum';
import React from 'react';

interface ConfirmEnrollmentDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    onConfirmDirect?: () => void;
    courseName: string;
    pricingLabel: string;
    price: number;
    isPaid: boolean;
    currentBalance?: number;
}

export const ConfirmEnrollmentDialog = React.memo<ConfirmEnrollmentDialogProps>(({ 
    open, 
    onClose, 
    onConfirm,
    onConfirmDirect,
    courseName, 
    pricingLabel, 
    price, 
    isPaid, 
    currentBalance = 0 
}) => {
    const canPayWithWallet = isPaid && currentBalance >= price;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Confirm Enrollment</DialogTitle>
                    <DialogDescription>
                        Choose your preferred payment method.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="rounded-lg border p-4 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Course:</span>
                            <span className="text-sm font-medium">{courseName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Pricing Plan:</span>
                            <span className="text-sm font-medium">{pricingLabel}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Price:</span>
                            <span className="text-sm font-bold">
                                {isPaid ? `$${price.toFixed(2)}` : 'Free'}
                            </span>
                        </div>
                        {isPaid && canPayWithWallet && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Current Balance:</span>
                                    <span className="text-sm">${currentBalance.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Balance After:</span>
                                    <span className="text-sm font-medium">
                                        ${(currentBalance - price).toFixed(2)}
                                    </span>
                                </div>
                            </>
                        )}
                         {isPaid && !canPayWithWallet && (
                            <div className="flex justify-between text-destructive">
                                <span className="text-sm">Insufficient Wallet Balance</span>
                                <span className="text-sm">${currentBalance.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter className="flex-col sm:flex-col gap-2">
                   {isPaid ? (
                        <>
                             {canPayWithWallet && (
                                <Button onClick={onConfirm} className="w-full">
                                    Pay with Wallet
                                </Button>
                            )}
                            {onConfirmDirect && (
                                <Button onClick={onConfirmDirect} variant="secondary" className="w-full">
                                    Pay with Card
                                </Button>
                            )}
                        </>
                   ) : (
                        <Button onClick={onConfirm} className="w-full">
                            Enroll for Free
                        </Button>
                   )}
                    <Button variant="ghost" onClick={onClose} className="w-full">
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});


export default ConfirmEnrollmentDialog