import { createAuthorizedNatsRequest } from '@/lib/utils/createNatsRequest';
import { IWallet } from '@/lib/types/wallet/IWallet';
import {
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
  PaymentPurpose,
  PaymentStatusResponse,
} from '@/lib/types/payment/payment.interface';

/**
 * Get user's wallet
 */
export async function getWallet(): Promise<IWallet> {
  const response =
    await createAuthorizedNatsRequest<IWallet>('wallet.findByUser');

  return response;
}

/**
 * Create payment link for wallet credit
 */
export async function createWalletPaymentLink(
  request: CreatePaymentLinkRequest,
): Promise<CreatePaymentLinkResponse> {
  const response = await createAuthorizedNatsRequest<CreatePaymentLinkResponse>(
    'payment.create-payment-url',
    request,
  );

  return response;
}

/**
 * Check payment status
 */
export async function checkPaymentStatus(
  provider: string,
  paymentId: string,
): Promise<PaymentStatusResponse> {
  const response = await createAuthorizedNatsRequest('wallet.payment.status', {
    provider,
    paymentId,
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to check payment status');
  }

  return response.data;
}

/**
 * Get wallet transaction history
 */
export async function getTransactionHistory(
  page: number = 1,
  limit: number = 10,
) {
  const response = await createAuthorizedNatsRequest(
    'wallet.transactions.list',
    { page, limit },
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch transactions');
  }

  return response.data;
}
