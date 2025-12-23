import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { IWallet } from '@/lib/types/wallet/IWallet';
import { toast } from 'react-toastify';
import {
  getWallet,
  createWalletPaymentLink,
  checkPaymentStatus,
} from '@/lib/actions/wallet/wallet.actions';
import { CreatePaymentLinkRequest } from '@/lib/types/payment/payment.interface';

// Query keys
export const walletKeys = {
  all: ['wallet'] as const,
  wallet: () => [...walletKeys.all, 'detail'] as const,
  transactions: (page?: number) =>
    [...walletKeys.all, 'transactions', page] as const,
  paymentStatus: (provider: string, paymentId: string) =>
    [...walletKeys.all, 'payment', provider, paymentId] as const,
};

/**
 * Hook to fetch wallet data
 */
export function useWallet() {
  return useQuery({
    queryKey: walletKeys.wallet(),
    queryFn: getWallet,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to create payment link for adding funds
 */
export function useCreatePaymentLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreatePaymentLinkRequest) => {
      return await createWalletPaymentLink(request);
    },
    onSuccess: (data) => {
      // Invalidate wallet query to refresh after payment
      queryClient.invalidateQueries({ queryKey: walletKeys.wallet() });

      // Redirect to payment URL
      window.location.href = data.paymentUrl;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create payment link');
    },
  });
}
/**
 * Hook to check payment status
 */
export function usePaymentStatus(
  provider: string,
  paymentId: string,
  enabled: boolean = false,
) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: walletKeys.paymentStatus(provider, paymentId),
    queryFn: () => checkPaymentStatus(provider, paymentId),
    enabled: enabled && !!provider && !!paymentId,
    refetchInterval: (query) => {
      // Stop polling if payment is completed or failed
      if (
        query.state.data?.status === 'completed' ||
        query.state.data?.status === 'failed'
      ) {
        return false;
      }
      // Poll every 3 seconds while pending
      return 3000;
    },
  });

  useEffect(() => {
    if (query.data) {
      if (query.data.status === 'completed') {
        toast.success(
          `Payment of ${query.data.currency} ${query.data.amount} completed successfully!`,
        );
        // Refresh wallet data
        queryClient.invalidateQueries({ queryKey: walletKeys.wallet() });
      } else if (query.data.status === 'failed') {
        toast.error('Payment failed. Please try again.');
      }
    }
  }, [query.data, queryClient]);

  return query;
}

/**
 * Hook to refresh wallet data manually
 */
export function useRefreshWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: walletKeys.wallet() });
      return await getWallet();
    },
    onSuccess: () => {
      toast.success('Wallet data refreshed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to refresh wallet');
    },
  });
}
