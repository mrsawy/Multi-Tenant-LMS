import { Currency } from "@/lib/data/currency.enum";
import { PaymentMethod, PaymentProvider } from "../payment/payment.interface";
import { BillingCycle } from "../course/enum/BillingCycle.enum";


export interface CreateEnrollmentHttpDto {
    courseId: string;
    paymentMethod: PaymentMethod;
    billingCycle: BillingCycle
    provider: PaymentProvider
    currency: Currency
}
