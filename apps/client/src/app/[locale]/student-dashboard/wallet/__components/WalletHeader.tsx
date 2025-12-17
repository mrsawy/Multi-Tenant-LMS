import { WalletIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export const WalletHeader = () => {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/student-dashboard/courses"
            className="flex items-center gap-2"
          >
            <WalletIcon className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              My Wallet
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};