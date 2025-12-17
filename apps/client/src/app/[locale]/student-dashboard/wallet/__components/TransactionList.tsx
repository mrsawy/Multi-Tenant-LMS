'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card';
import { Transaction } from '@/lib/types/transaction/ITransaction.interface';

import { WalletIcon } from 'lucide-react';
import { TransactionItem } from './TransactionItem';


interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList = ({ transactions }: TransactionListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>

        {transactions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <WalletIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No transactions yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
