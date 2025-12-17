// app/student-dashboard/wallet/__components/AddFundsDialog.tsx
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
import { Loader2, CreditCard, Smartphone, Wallet } from 'lucide-react';
import { toast } from 'react-toastify';
import { useCreatePaymentLink } from '@/lib/hooks/wallet/use-wallet';
import { Alert, AlertDescription } from '@/components/atoms/alert';
import { RadioGroup, RadioGroupItem } from '@/components/atoms/radio-group';
import {
  PaymentProvider,
  PaymentMethod,
  PaymentPurpose,
  PaymentOption,
} from '@/lib/types/payment/payment.interface';

interface AddFundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  onSuccess?: () => void;
}

// Define all available payment options
const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'paymob-card',
    provider: PaymentProvider.PAYMOB,
    method: PaymentMethod.CREDIT_CARD,
    name: 'Credit/Debit Card',
    description: 'Pay with your credit or debit card',
    icon: CreditCard,
    logo: '💳',
    currencies: ['EGP', 'USD', 'EUR'],
  },
  {
    id: 'paymob-wallet',
    provider: PaymentProvider.PAYMOB,
    method: PaymentMethod.MOBILE_WALLET,
    name: 'Mobile Wallet',
    description: 'Vodafone Cash, Orange Cash, Etisalat Cash',
    icon: Smartphone,
    logo: '📱',
    currencies: ['EGP'],
  },
  {
    id: 'paypal',
    provider: PaymentProvider.PAYPAL,
    method: PaymentMethod.PAYPAL,
    name: 'PayPal',
    description: 'Pay with your PayPal account',
    icon: Wallet,
    logo: '🅿️',
    currencies: ['USD', 'EUR', 'EGP'],
  },
];

const MIN_AMOUNTS: Record<string, number> = {
  USD: 1,
  EUR: 1,
  GBP: 1,
  EGP: 50,
};

const MAX_AMOUNTS: Record<string, number> = {
  USD: 10000,
  EUR: 10000,
  GBP: 10000,
  EGP: 200000,
};

export const AddFundsDialog = ({
  open,
  onOpenChange,
  currency,
  onSuccess,
}: AddFundsDialogProps) => {
  const [amount, setAmount] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [description, setDescription] = useState('');

  const { mutate: createPayment, isPending } = useCreatePaymentLink();

  // Filter options that support the current currency
  const availableOptions = PAYMENT_OPTIONS.filter((option) =>
    option.currencies.includes(currency),
  );

  const minAmount = MIN_AMOUNTS[currency] || 1;
  const maxAmount = MAX_AMOUNTS[currency] || 100000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);

    // Find selected payment option
    const paymentOption = availableOptions.find(
      (opt) => opt.id === selectedOption,
    );

    if (!paymentOption) {
      toast.error('Please select a payment method');
      return;
    }

    // Validation
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    if (numAmount < minAmount) {
      toast.error(`Minimum amount is ${currency} ${minAmount}`);
      return;
    }

    if (numAmount > maxAmount) {
      toast.error(`Maximum amount is ${currency} ${maxAmount}`);
      return;
    }

    // Check decimal places
    const decimalPlaces = (amount.split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      toast.error('Amount cannot have more than 2 decimal places');
      return;
    }

    createPayment(
      {
        amount: numAmount,
        currency,
        provider: paymentOption.provider,
        method: paymentOption.method,
        purpose: PaymentPurpose.WALLET_CREDIT,
        metadata: {
          description: description || 'Add funds to wallet',
          integrationId: paymentOption.integrationId,
        },
      },
      {
        onSuccess: () => {
          setAmount('');
          setDescription('');
          setSelectedOption('');
          onSuccess?.();
        },
      },
    );
  };

  // Auto-select first option if none selected
  if (!selectedOption && availableOptions.length > 0) {
    setSelectedOption(availableOptions[0].id);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Funds to Wallet</DialogTitle>
            <DialogDescription>
              Choose your payment method and enter the amount you want to
              deposit.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Payment Method Selection */}
            <div className="grid gap-3">
              <Label>Payment Method</Label>
              {availableOptions.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No payment methods available for {currency}. Please contact
                    support.
                  </AlertDescription>
                </Alert>
              ) : (
                <RadioGroup
                  value={selectedOption}
                  onValueChange={setSelectedOption}
                  disabled={isPending}
                >
                  <div className="grid gap-3">
                    {availableOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = selectedOption === option.id;

                      return (
                        <label
                          key={option.id}
                          className={`
                            flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer
                            transition-all hover:border-primary/50
                            ${
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 dark:border-gray-700'
                            }
                            ${isPending ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                        >
                          <RadioGroupItem value={option.id} id={option.id} />
                          <div className="flex items-center gap-3 flex-1">
                            <div className="text-2xl">{option.logo}</div>
                            <div className="flex-1">
                              <div className="font-semibold flex items-center gap-2">
                                {option.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {option.description}
                              </div>
                            </div>
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </RadioGroup>
              )}
            </div>

            {/* Amount Input */}
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount ({currency})</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min={minAmount}
                max={maxAmount}
                placeholder={`Min: ${minAmount}, Max: ${maxAmount}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={isPending || availableOptions.length === 0}
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Enter amount between {currency} {minAmount} and {currency}{' '}
                {maxAmount}
              </p>
            </div>

            {/* Description (Optional) */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                type="text"
                placeholder="e.g., Monthly deposit"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
                maxLength={100}
              />
            </div>

            {/* Summary */}
            {amount && parseFloat(amount) > 0 && selectedOption && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="font-semibold">
                    {currency} {parseFloat(amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Payment Method:
                  </span>
                  <span className="font-semibold">
                    {
                      availableOptions.find((p) => p.id === selectedOption)
                        ?.name
                    }
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isPending || availableOptions.length === 0 || !selectedOption
              }
              effect="expandIcon"
            >
              Proceed to Payment
              {isPending && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
