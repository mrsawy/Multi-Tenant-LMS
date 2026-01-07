// ============= SingleCourseOverView.tsx =============
import { ICourseOverview } from '@/lib/types/course/course.interface';
import { IUser } from '@/lib/types/user/user.interface';
import { BillingCycle } from '@/lib/types/course/enum/BillingCycle.enum';
import { useWallet } from '@/lib/hooks/wallet/use-wallet';
import { createAuthorizedNatsRequest } from '@/lib/utils/createNatsRequest';
import { toast } from 'react-toastify';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CourseEnrollmentCard } from '@/components/organs/course-enrollment-card';
import AuthDialog from '@/components/organs/auth-dialog';
import InsufficientBalanceDialog from '@/components/organs/insufficient-balance-dialog';
import ConfirmEnrollmentByWalletDialog from '@/components/organs/confirm-enrollment-dialog';
import PaymentMethodSelectionDialog from '@/components/organs/payment-method-selection-dialog';
import ConfirmFreeEnrollmentDialog from '@/components/organs/confirm-free-enrollment-dialog';
import { IWallet } from '@/lib/types/wallet/IWallet';
import { CreateEnrollmentHttpDto } from '@/lib/types/enrollment/createEnrollment.dto';
import { PaymentMethod, PaymentProvider } from '@/lib/types/payment/payment.interface';
import { PaymentResponse } from '@/lib/types/payment/directPaymentResponse.interface';
import { Currency } from '@/lib/data/currency.enum';
import { useRouter } from 'next/navigation';

type DialogType = 'auth' | 'insufficient-balance' | 'confirm-enrollment' | 'payment-method-selection' | 'confirm-free-enrollment' | null;

const getPricingLabel = (type: BillingCycle): string => {
  switch (type) {
    case BillingCycle.MONTHLY:
      return 'Monthly';
    case BillingCycle.YEARLY:
      return 'Yearly';
    case BillingCycle.ONE_TIME:
      return 'One-time';
    default:
      return type;
  }
};

interface SingleCourseOverViewProps {
  course: ICourseOverview;
  user?: IUser;
}

const SingleCourseOverView: React.FC<SingleCourseOverViewProps> = ({ course, user }) => {
  const { data: wallet = { _id: '', balance: 0 } as IWallet } = useWallet();
  const router = useRouter();

  const [selectedPricing, setSelectedPricing] = useState<BillingCycle>(BillingCycle.ONE_TIME);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(
    null
  );
  const [dialogType, setDialogType] = useState<DialogType>(null);

  // Calculate time left for discount
  useEffect(() => {
    if (!course.isPaid) return;

    const updateTimeLeft = () => {
      const currentPricing = course.pricing[selectedPricing];
      if (!currentPricing || !currentPricing.discountEndDate) return;

      const now = new Date().getTime();
      const endTime = new Date(currentPricing.discountEndDate).getTime();
      const difference = endTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft({ days, hours, minutes });
      } else {
        setTimeLeft(null);
      }
    };

    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 60000);

    return () => clearInterval(timer);
  }, [selectedPricing, course.isPaid, course.pricing]);

  // Memoize current price calculation
  const currentPrice = useMemo(() => {
    if (!course.isPaid) return 0;
    const pricing = course.pricing[selectedPricing];
    if (!pricing) return 0;

    const mainPrice =
      user?.preferredCurrency == Currency.USD ? pricing.priceUSD : pricing.originalPrice;
    const discountedPrice = pricing.discountPercentage
      ? mainPrice * (1 - pricing.discountPercentage / 100)
      : mainPrice;
    return discountedPrice;
  }, [course.isPaid, course.pricing, selectedPricing]);

  // Handlers wrapped in useCallback to prevent re-renders
  const handlePricingChange = useCallback((pricing: BillingCycle) => {
    setSelectedPricing(pricing);
  }, []);

  const handleEnrollment = useCallback(() => {
    if (!user) {
      setDialogType('auth');
      return;
    }

    if (!course.isPaid) {
      // Show free enrollment confirmation dialog
      setDialogType('confirm-free-enrollment');
      return;
    }

    // Check if user has enough balance
    const hasEnoughBalance = wallet.balance >= currentPrice;
    const currencyMatches = user?.preferredCurrency === course.pricing[selectedPricing]?.originalCurrency;

    if (hasEnoughBalance && currencyMatches) {
      // Show payment method selection dialog
      setDialogType('payment-method-selection');
    } else {
      // Proceed with direct payment
      handleConfirmEnrollment();
    }
  }, [user, currentPrice, wallet.balance, course.pricing, selectedPricing, course.isPaid]);

  const handleConfirmEnrollment = useCallback(async () => {
    try {
      const enrollmentPayload: CreateEnrollmentHttpDto = {
        courseId: course._id,
        billingCycle: selectedPricing,
        paymentMethod: PaymentMethod.DIRECT,
        provider: PaymentProvider.PAYMOB,
        currency: user!.preferredCurrency,
      };

      const response = await createAuthorizedNatsRequest<PaymentResponse>(
        'enrollment.enrollToCourse',
        enrollmentPayload
      );
      console.log({ response });

      // Redirect to payment URL for direct payment
      window.location.href = response.paymentUrl;

      setDialogType(null);
    } catch (error: any) {
      console.error('Enrollment failed:', error);
      if (error.message.includes('userId_1_courseId_1')) {
        toast.error('Already Enrolled To That Course.');
        return;
      }
      toast.error('Enrollment failed: ' + error.message);
    }
  }, [course._id, user, selectedPricing]);

  const handleEnrollmentFree = useCallback(async () => {
    try {
      const response = await createAuthorizedNatsRequest(
        'enrollment.enrollToFreeCourse',
        { courseId: course._id }
      );
      console.log({ response });

      setDialogType(null);
      toast.success('Successfully enrolled in course!');

      // Route to student dashboard courses page
      router.push('/student-dashboard/courses');
    } catch (error: any) {
      console.error('Enrollment failed:', error);
      if (error.message.includes('userId_1_courseId_1')) {
        toast.error('Already Enrolled To That Course.');
        return;
      }
      toast.error('Enrollment failed: ' + error.message);
    }
  }, [course._id, router]);

  const handleEnrollmentWithWallet = useCallback(async () => {
    try {
      const enrollmentPayload: CreateEnrollmentHttpDto = {
        courseId: course._id,
        billingCycle: selectedPricing,
        paymentMethod: PaymentMethod.WALLET,
        provider: PaymentProvider.PAYMOB,
        currency: user!.preferredCurrency,
      };

      const response = await createAuthorizedNatsRequest(
        'enrollment.enrollToCourse',
        enrollmentPayload
      );
      console.log({ response });

      setDialogType(null);
      toast.success('Successfully enrolled in course!');

      // Route to student dashboard courses page
      router.push('/student-dashboard/courses');
    } catch (error: any) {
      console.error('Enrollment failed:', error);
      if (error.message.includes('userId_1_courseId_1')) {
        toast.error('Already Enrolled To That Course.');
        return;
      }
      toast.error('Enrollment failed: ' + error.message);
    }
  }, [course._id, user, selectedPricing, router]);

  const handleCloseDialog = useCallback(() => {
    setDialogType(null);
  }, []);

  return (
    <>
      <CourseEnrollmentCard
        user={user}
        course={course}
        wallet={wallet}
        selectedPricing={selectedPricing}
        onPricingChange={handlePricingChange}
        onEnroll={handleEnrollment}
        timeLeft={timeLeft}
      />

      <AuthDialog open={dialogType === 'auth'} onClose={handleCloseDialog} />

      <ConfirmFreeEnrollmentDialog
        open={dialogType === 'confirm-free-enrollment'}
        onClose={handleCloseDialog}
        onConfirm={handleEnrollmentFree}
        courseName={course.name}
      />

      <PaymentMethodSelectionDialog
        open={dialogType === 'payment-method-selection'}
        onClose={handleCloseDialog}
        onSelectWallet={handleEnrollmentWithWallet}
        onSelectDirect={handleConfirmEnrollment}
        courseName={course.name}
        price={currentPrice}
        currentBalance={wallet.balance}
      />

      {/* <ConfirmEnrollmentByWalletDialog
        open={dialogType === 'confirm-enrollment'}
        onClose={handleCloseDialog}
        onConfirm={handleEnrollmentWithWallet}
        onConfirmDirect={handleConfirmEnrollment}
        courseName={course.name}
        pricingLabel={getPricingLabel(selectedPricing)}
        price={currentPrice}
        isPaid={course.isPaid}
        currentBalance={wallet.balance}
      /> */}
    </>
  );
};

export default SingleCourseOverView;
