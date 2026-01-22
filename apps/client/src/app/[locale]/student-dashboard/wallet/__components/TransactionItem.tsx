'use client';

import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/atoms/badge';
import { Transaction, TransactionType } from '@/lib/types/transaction/ITransaction.interface';
import { TransactionDetailsModal } from './TransactionDetailsModal';
import { useTranslations } from 'next-intl';


interface TransactionItemProps {
  transaction: Transaction;
}

export const TransactionItem = ({ transaction }: TransactionItemProps) => {
  const t = useTranslations('Wallet.transactionItem.status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const getTransactionIcon = () => {
    switch (transaction.type) {
      case TransactionType.CREDIT:
        return <ArrowDownRight className="size-5" />;
      case TransactionType.DEBIT:
        return <ArrowUpRight className="size-5" />;
      case TransactionType.TRANSFER:
        return <ArrowLeftRight className="size-5" />;
      default:
        return <ArrowDownRight className="size-5" />;
    }
  };

  const getTransactionColor = () => {
    switch (transaction.type) {
      case TransactionType.CREDIT:
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case TransactionType.DEBIT:
        return 'bg-destructive/10 text-destructive';
      case TransactionType.TRANSFER:
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getAmountColor = () => {
    switch (transaction.type) {
      case TransactionType.CREDIT:
        return 'text-green-600 dark:text-green-400';
      case TransactionType.DEBIT:
        return 'text-destructive';
      case TransactionType.TRANSFER:
        return 'text-primary';
      default:
        return 'text-foreground';
    }
  };

  const getAmountPrefix = () => {
    return transaction.type === TransactionType.CREDIT ? '+' : '-';
  };

  return (
    <>
      <div
        className='flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer'
        onClick={() => setIsModalOpen(true)}
      >
        <div className='flex items-center gap-4'>
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center ${getTransactionColor()}`}
          >
            {getTransactionIcon()}
          </div>
          <div>
            <p className='font-medium text-card-foreground'>{transaction.description}</p>
            <p className='text-sm text-muted-foreground'>
              {format(new Date(transaction.createdAt), 'MMM dd, yyyy • HH:mm')}
            </p>
          </div>
        </div>
        <div className='text-right'>
          <p className={`font-bold text-lg ${getAmountColor()}`}>
            {getAmountPrefix()}${transaction.amount.toFixed(2)}
          </p>
          <Badge
            variant={transaction.status === 'completed' ? 'default' : 'secondary'}
          >
            {t(transaction.status as 'completed' | 'failed' | 'pending')}
          </Badge>
        </div>
      </div>

      <TransactionDetailsModal
        transaction={transaction}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
};