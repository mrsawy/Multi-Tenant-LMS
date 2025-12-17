'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { Button } from '@/components/atoms/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/atoms/alert';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { usePaymentStatus } from '@/lib/hooks/wallet/use-wallet';

export default function PaymentReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [checkStatus, setCheckStatus] = useState(true);

  const provider = searchParams.get('provider') || '';
  const paymentId = searchParams.get('paymentId') || searchParams.get('token') || '';
  const success = searchParams.get('success') === 'true';

  const {
    data: paymentStatus,
    isLoading,
    error,
    refetch,
  } = usePaymentStatus(provider.toUpperCase(), paymentId, checkStatus);

  useEffect(() => {
    // Stop checking after 30 seconds
    const timeout = setTimeout(() => {
      setCheckStatus(false);
    }, 30000);

    return () => clearTimeout(timeout);
  }, []);

  const handleReturnToWallet = () => {
    router.push('/student-dashboard/wallet');
  };

  // Loading state
  if (isLoading || (!paymentStatus && checkStatus)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <h2 className="text-2xl font-bold">Processing Payment...</h2>
              <p className="text-muted-foreground">
                Please wait while we confirm your payment.
                <br />
                Do not close this window.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !paymentStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-6 w-6" />
              Unable to Verify Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                We couldn't verify your payment status. Please check your wallet or
                contact support if money was deducted.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button onClick={handleReturnToWallet} className="flex-1">
                Return to Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (paymentStatus.status === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-green-200 dark:border-green-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-6 w-6" />
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-200">
                Wallet Credited Successfully
              </AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300">
                Your wallet has been credited with {paymentStatus.currency}{' '}
                {paymentStatus.amount.toFixed(2)}
              </AlertDescription>
            </Alert>

            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">
                  {paymentStatus.currency} {paymentStatus.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono text-xs">
                  {paymentStatus.transactionId.slice(0, 20)}...
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-semibold capitalize">{provider}</span>
              </div>
            </div>

            <Button onClick={handleReturnToWallet} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Failed state
  if (paymentStatus.status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-6 w-6" />
              Payment Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTitle>Transaction Failed</AlertTitle>
              <AlertDescription>
                Your payment could not be processed. No money has been deducted
                from your account.
              </AlertDescription>
            </Alert>

            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono text-xs">
                  {paymentStatus.transactionId}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleReturnToWallet} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Wallet
              </Button>
              <Button
                onClick={() => router.push('/student-dashboard/wallet')}
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pending state
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <Loader2 className="h-16 w-16 animate-spin text-yellow-500" />
            <h2 className="text-2xl font-bold">Payment Pending</h2>
            <p className="text-muted-foreground">
              Your payment is being processed. This may take a few moments.
            </p>
            <Button onClick={handleReturnToWallet} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}