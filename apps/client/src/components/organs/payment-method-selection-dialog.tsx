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
import { Wallet, CreditCard } from 'lucide-react';
import React from 'react';

interface PaymentMethodSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectWallet: () => void;
  onSelectDirect: () => void;
  courseName: string;
  price: number;
  currentBalance: number;
}

export const PaymentMethodSelectionDialog = React.memo<PaymentMethodSelectionDialogProps>(({
  open,
  onClose,
  onSelectWallet,
  onSelectDirect,
  courseName,
  price,
  currentBalance,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Payment Method</DialogTitle>
          <DialogDescription>
            You have sufficient balance. How would you like to pay?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Course:</span>
              <span className="text-sm font-medium">{courseName}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Price:</span>
              <span className="text-sm font-bold">${price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Your Balance:</span>
              <span className="text-sm font-medium text-green-600">${currentBalance.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={onSelectWallet} className="w-full" variant="default">
            <Wallet className="mr-2 h-4 w-4" />
            Pay with Wallet
          </Button>
          <Button onClick={onSelectDirect} variant="secondary" className="w-full">
            <CreditCard className="mr-2 h-4 w-4" />
            Pay with Card
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

PaymentMethodSelectionDialog.displayName = 'PaymentMethodSelectionDialog';

export default PaymentMethodSelectionDialog;

