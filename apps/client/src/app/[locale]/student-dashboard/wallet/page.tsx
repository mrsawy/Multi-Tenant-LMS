

import { ArrowLeft, Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { createAuthorizedNatsRequest } from '@/lib/utils/createNatsRequest';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';

const WalletPage = async () => {
    const wallet = await createAuthorizedNatsRequest("wallet.getUserWallet", {});
    console.log({ wallet })
    return (
        <div className="min-h-screen  ">
            {/* Header */}
            <header className="border-b  ">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/student-dashboard/courses" className="flex items-center gap-2">
                            <WalletIcon className="h-8 w-8 text-primary" />
                            <span className="text-2xl font-bold text-foreground">My Wallet</span>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Balance Card */}
                <Card className="mb-8 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <p className="text-primary-foreground/80 mb-2">Available Balance</p>
                                <h2 className="text-5xl font-bold">
                                    {wallet.balance.toFixed(2)}
                                </h2>
                                <p className="text-primary-foreground/60 mt-2">{wallet.currency}</p>
                            </div>
                            <WalletIcon className="h-12 w-12 text-primary-foreground/20" />
                        </div>

                        <div className="flex gap-3">
                            <Button variant="secondary" className="flex-1">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Funds
                            </Button>
                            <Button 
                            variant="outline"
                             className="flex-1 bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 border-4">
                                Withdraw
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Transaction History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            { wallet.transactionsHistory.map((transaction: any) => (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${transaction.type === 'credit'
                                            ? 'bg-green-500/10 text-green-500'
                                            : 'bg-red-500/10 text-red-500'
                                            }`}>
                                            {transaction.type === 'credit' ? (
                                                <ArrowDownRight className="h-5 w-5" />
                                            ) : (
                                                <ArrowUpRight className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">{transaction.description}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(transaction.createdAt), 'MMM dd, yyyy • HH:mm')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold text-lg ${transaction.type === 'credit' ? 'text-green-500' : 'text-red-500'
                                            }`}>
                                            {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                        </p>
                                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                                            {transaction.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {wallet.transactionsHistory.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <WalletIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>No transactions yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default WalletPage;