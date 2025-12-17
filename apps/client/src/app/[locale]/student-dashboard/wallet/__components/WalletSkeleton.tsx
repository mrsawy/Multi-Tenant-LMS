import { Card, CardContent, CardHeader } from '@/components/atoms/card';
import { Skeleton } from '@/components/atoms/skeleton';

export const WalletBalanceSkeleton = () => {
  return (
    <Card className="bg-gradient-to-l dark:bg-gradient-to-br from-primary to-primary/80 border-0">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2 bg-primary-foreground/20" />
            <Skeleton className="h-12 w-40 mb-2 bg-primary-foreground/20" />
            <Skeleton className="h-4 w-16 bg-primary-foreground/20" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full bg-primary-foreground/20" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 bg-primary-foreground/20" />
          <Skeleton className="h-10 flex-1 bg-primary-foreground/20" />
        </div>
      </CardContent>
    </Card>
  );
};

export const TransactionListSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-36 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-6 w-20 mb-2" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
