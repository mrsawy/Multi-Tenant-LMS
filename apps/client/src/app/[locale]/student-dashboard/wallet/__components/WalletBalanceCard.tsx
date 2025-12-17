'use client';

import { WalletIcon, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/atoms/card';
import { Button } from '@/components/atoms/button';
import { useState } from 'react';
import { AddFundsDialog } from './AddFundsDialog';
import { WithdrawDialog } from './WithdrawDialog';

interface WalletBalanceCardProps {
  balance: number;
  currency: string;
  isFrozen?: boolean;
  onTransactionComplete?: () => void;
}

export const WalletBalanceCard = ({
  balance,
  currency,
  isFrozen = false,
  onTransactionComplete,
}: WalletBalanceCardProps) => {
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const handleTransactionSuccess = () => {
    setShowAddFunds(false);
    setShowWithdraw(false);
    onTransactionComplete?.();
  };

  return (
    <>
      <Card className="bg-gradient-to-l dark:bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-primary-foreground/80 mb-2">
                Available Balance
              </p>
              <h2 className="text-5xl font-bold">
                {balance.toFixed(2)}
              </h2>
              <p className="text-primary-foreground/60 mt-2">
                {currency}
              </p>
              {isFrozen && (
                <p className="text-yellow-300 mt-2 text-sm font-semibold">
                  ⚠️ Wallet is frozen
                </p>
              )}
            </div>
            <WalletIcon className="h-12 w-12 text-primary-foreground/20" />
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowAddFunds(true)}
              disabled={isFrozen}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Funds
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 border-4"
              onClick={() => setShowWithdraw(true)}
              disabled={isFrozen}
            >
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      <AddFundsDialog
        open={showAddFunds}
        onOpenChange={setShowAddFunds}
        currency={currency}
        onSuccess={handleTransactionSuccess}
      />

      <WithdrawDialog
        open={showWithdraw}
        onOpenChange={setShowWithdraw}
        currency={currency}
        currentBalance={balance}
        onSuccess={handleTransactionSuccess}
      />
    </>
  );
};
