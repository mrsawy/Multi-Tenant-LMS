'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';

import { Loader2, AlertCircle } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/atoms/alert';
import { useWallet } from '@/lib/hooks/wallet/use-wallet';
import { toast } from 'react-toastify';

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  currentBalance: number;
  onSuccess?: () => void;
}

export const WithdrawDialog = ({
  open,
  onOpenChange,
  currency,
  currentBalance,
  onSuccess,    
}: WithdrawDialogProps) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const { isLoading } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.success('Please enter a valid amount greater than 0');
      return;
    }

    if (numAmount > currentBalance) {
      toast.success(
        `You cannot withdraw more than your current balance (${currency} ${currentBalance.toFixed(2)})`,
      );
      return;
    }

    try {
      //   await withdraw(numAmount, currency, description || 'Withdrawal');
      toast.success(
        `Successfully withdrew ${currency} ${numAmount.toFixed(2)} from your wallet`,
      );
      setAmount('');
      setDescription('');
      onSuccess?.();
    } catch (error) {
      toast.success(
        error instanceof Error ? error.message : 'Failed to withdraw',
      );
    }
  };

  const numAmount = parseFloat(amount);
  const showWarning = !isNaN(numAmount) && numAmount > currentBalance;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Withdraw money from your wallet. Available balance: {currency}{' '}
              {currentBalance.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="withdraw-amount">Amount ({currency})</Label>
              <Input
                id="withdraw-amount"
                type="number"
                step="0.01"
                min="0.01"
                max={currentBalance}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="withdraw-description">
                Description (Optional)
              </Label>
              <Input
                id="withdraw-description"
                type="text"
                placeholder="e.g., Bank transfer"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {showWarning && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Amount exceeds available balance
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || showWarning}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Withdraw
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
