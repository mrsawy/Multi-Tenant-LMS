import { ICourse } from "../course/course.interface";
import { BillingCycle } from "../course/enum/BillingCycle.enum";

export enum SubscriptionStatus {
    ACTIVE = 'ACTIVE', EXPIRED = 'EXPIRED', CANCELLED = 'cancelled', SUSPENDED = 'cancelled'
}
export interface SubscriptionTypeDef {
    reminder_days?: number;
    status: SubscriptionStatus; // assuming "state" refers to subscription status
    starts_at: Date | string;
    next_billing?: Date | string;
    reminder_date?: Date | string;
    ends_at?: Date | string;
    resumed_at?: Date;
    suspended_at?: Date;
    reactivated_at?: Date;
    transaction_id?: string
    billing: {
        email: string,
        last_name: string,
        first_name: string,
        phone_number?: string,
        amount: number;
        currency: string;
        billingCycle: BillingCycle;
    };

    createdAt: Date | string;
    updatedAt: Date | string;
}


export interface IEnrollment {
    _id?: string;

    userId: string;
    courseId: string;
    course?: ICourse
    organizationId: string;

    enrolledAt: Date;
    completedAt?: Date;

    accessType: string//AccessType;

    subscription?: SubscriptionTypeDef;

    progressPercentage: number;
    timeSpentMinutes: number;
    lastAccessedAt: Date;

    progress: {
        completedModules: string[];
        completedLessons: string[];
        quizScores: {
            quizId: string;
            score: number;
            attempts: number;
            completedAt: Date;
        }[];
    };

    certificate: {
        issued: boolean;
        issuedAt?: Date;
        certificateUrl?: string;
    };

    createdAt?: Date;
    updatedAt?: Date;
}
