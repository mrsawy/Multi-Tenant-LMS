import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoosePaginate from "mongoose-paginate-v2"
import { SubscriptionType } from '../enum/subscriptionType.enum';
import { SubscriptionStatus } from '../enum/subscriptionStatus.enum';
import { BillingCycle } from '../enum/billingCycle.enum';

@Schema({ timestamps: true })
export class Subscription extends Document {
    // SUBSCRIPTION TYPE - What kind of subscription this is
    @Prop({
        enum: SubscriptionType,
        required: true
    })
    subscriptionType: string;

    // SUBSCRIBERS - Who is subscribing
    @Prop({ type: Types.ObjectId, ref: 'Organization' })
    organizationId: Types.ObjectId; // For organization subscriptions

    @Prop({ type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId; // For user subscriptions

    // SUBSCRIPTION TARGET - What they're subscribing to
    @Prop({ type: Types.ObjectId, ref: 'Plan' })
    planId: Types.ObjectId; // For plan subscriptions (org or user)

    @Prop({ type: Types.ObjectId, ref: 'Course' })
    courseId: Types.ObjectId; // For course subscriptions

    @Prop([{ type: Types.ObjectId, ref: 'Course' }])
    courseIds: Types.ObjectId[]; // For multi-course subscriptions

    // SUBSCRIPTION STATUS & TIMING
    @Prop({ enum: SubscriptionStatus, default: 'active' })
    status: string;

    @Prop({ required: true, default: Date.now })
    startDate: Date;

    @Prop({ required: true })
    endDate: Date;

    // @Prop()
    // trialEndDate: Date; // For trial periods

    @Prop()
    cancelledAt: Date;

    @Prop()
    suspendedAt: Date;

    // BILLING INFORMATION
    @Prop({ required: true })
    billing: {
        amount: number;
        currency: string;
        billingCycle:BillingCycle;
        nextBillingDate?: Date;

        // Payment tracking
        totalPaid: number;
        lastPaymentDate?: Date;
        lastPaymentAmount?: number;
        paymentMethod?: string;

        // Stripe/Payment processor IDs
        stripeSubscriptionId?: string;
        stripeCustomerId?: string;

        // Trial info
        isTrialPeriod?: boolean;
        trialDays?: number;

        // Discount/Coupon
        discountPercent?: number;
        couponCode?: string;
    };

    // SUBSCRIPTION FEATURES & LIMITS
    @Prop()
    features: {
        // For organization plans
        maxUsers?: number;
        maxCourses?: number;
        maxStorageGB?: number;
        customBranding?: boolean;
        analytics?: boolean;
        apiAccess?: boolean;
        prioritySupport?: boolean;

        // For course/user subscriptions
        downloadAccess?: boolean;
        certificateAccess?: boolean;
        communityAccess?: boolean;
        lifetimeUpdates?: boolean;

        // General features
        features?: string[]; // Flexible feature list
    };

    // USAGE TRACKING (for plans with limits)
    @Prop()
    usage: {
        currentUsers?: number;
        currentCourses?: number;
        storageUsedGB?: number;
        apiCallsThisMonth?: number;
        lastUsageUpdate?: Date;
    };

    // RENEWAL & PAYMENT HISTORY
    @Prop()
    renewalHistory: [{
        renewedAt: Date;
        amount: number;
        billingCycle: string;
        endDate: Date;
        transactionId: string;
        paymentMethod: string;
    }];

    // CANCELLATION INFO
    @Prop()
    cancellation: {
        reason?: string;
        cancelledBy?: Types.ObjectId; // User who cancelled
        refundAmount?: number;
        refundStatus?: 'pending' | 'completed' | 'rejected';
        cancelAtPeriodEnd?: boolean; // Don't cancel immediately
    };

    // METADATA
    @Prop()
    metadata: {
        source?: string; // web, mobile, api
        campaign?: string; // marketing campaign
        referralCode?: string;
        notes?: string;
    };
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

// VIRTUALS
SubscriptionSchema.virtual("organization", {
    ref: "Organization",
    localField: "organizationId",
    foreignField: "_id",
    justOne: true
});

SubscriptionSchema.virtual("user", {
    ref: "User",
    localField: "userId",
    foreignField: "_id",
    justOne: true
});

SubscriptionSchema.virtual("plan", {
    ref: "Plan",
    localField: "planId",
    foreignField: "_id",
    justOne: true
});

SubscriptionSchema.virtual("course", {
    ref: "Course",
    localField: "courseId",
    foreignField: "_id",
    justOne: true
});

SubscriptionSchema.virtual("courses", {
    ref: "Course",
    localField: "courseIds",
    foreignField: "_id"
});

// COMPUTED PROPERTIES
SubscriptionSchema.virtual('isActive').get(function () {
    const now = new Date();

    if (this.status !== 'active') return false;
    if (this.endDate && this.endDate < now) return false;
    if (this.billing?.isTrialPeriod && this.trialEndDate && this.trialEndDate < now) return false;

    return true;
});

SubscriptionSchema.virtual('daysUntilExpiry').get(function () {
    if (!this.endDate) return null;

    const now = new Date();
    const diffTime = this.endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
});

SubscriptionSchema.virtual('isInTrial').get(function () {
    const now = new Date();
    return this.billing?.isTrialPeriod &&
        this.trialEndDate &&
        this.trialEndDate > now;
});

// INSTANCE METHODS
SubscriptionSchema.methods.renew = function (billingCycle?: string, amount?: number, transactionId?: string) {
    const now = new Date();
    const newEndDate = new Date();

    const cycle = billingCycle || this.billing.billingCycle;

    // Calculate new end date
    if (cycle === 'monthly') {
        newEndDate.setMonth(newEndDate.getMonth() + 1);
    } else if (cycle === 'yearly') {
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    }

    // Update subscription
    this.endDate = newEndDate;
    this.status = 'active';
    this.billing.nextBillingDate = newEndDate;
    this.billing.lastPaymentDate = now;
    this.billing.lastPaymentAmount = amount || this.billing.amount;
    this.billing.totalPaid += (amount || this.billing.amount);

    // Add to renewal history
    if (!this.renewalHistory) this.renewalHistory = [];
    this.renewalHistory.push({
        renewedAt: now,
        amount: amount || this.billing.amount,
        billingCycle: cycle,
        endDate: newEndDate,
        transactionId: transactionId || '',
        paymentMethod: this.billing.paymentMethod || ''
    });
};

SubscriptionSchema.methods.cancel = function (reason?: string, cancelledBy?: string, refundAmount?: number) {
    this.status = 'cancelled';
    this.cancelledAt = new Date();

    this.cancellation = {
        reason,
        cancelledBy: cancelledBy ? new Types.ObjectId(cancelledBy) : undefined,
        refundAmount,
        refundStatus: refundAmount ? 'pending' : undefined
    };

    // Clear next billing
    this.billing.nextBillingDate = null;
};

SubscriptionSchema.methods.suspend = function (reason?: string) {
    this.status = 'suspended';
    this.suspendedAt = new Date();
    this.metadata = this.metadata || {};
    this.metadata.notes = reason;
};

SubscriptionSchema.methods.updateUsage = function (usageData: any) {
    this.usage = { ...this.usage, ...usageData, lastUsageUpdate: new Date() };
};

SubscriptionSchema.methods.hasFeature = function (featureName: string): boolean {
    if (!this.isActive) return false;

    return this.features?.[featureName] ||
        this.features?.features?.includes(featureName) ||
        false;
};

SubscriptionSchema.methods.canAddUser = function (): boolean {
    if (!this.isActive || this.subscriptionType !== 'organization_plan') return false;

    const maxUsers = this.features?.maxUsers;
    const currentUsers = this.usage?.currentUsers || 0;

    return !maxUsers || currentUsers < maxUsers;
};

SubscriptionSchema.methods.canAddCourse = function (): boolean {
    if (!this.isActive || this.subscriptionType !== 'organization_plan') return false;

    const maxCourses = this.features?.maxCourses;
    const currentCourses = this.usage?.currentCourses || 0;

    return !maxCourses || currentCourses < maxCourses;
};

// STATIC METHODS
SubscriptionSchema.statics.createOrganizationSubscription = function (
    organizationId: string,
    planId: string,
    billingData: any
) {
    const endDate = new Date();
    if (billingData.billingCycle === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
    } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
    }

    return this.create({
        subscriptionType: 'organization_plan',
        organizationId: new Types.ObjectId(organizationId),
        planId: new Types.ObjectId(planId),
        status: 'active',
        endDate,
        billing: {
            ...billingData,
            nextBillingDate: endDate,
            totalPaid: billingData.amount
        },
        usage: {
            currentUsers: 0,
            currentCourses: 0,
            storageUsedGB: 0
        }
    });
};

SubscriptionSchema.statics.createUserCourseSubscription = function (
    userId: string,
    courseId: string,
    billingData: any
) {
    const endDate = new Date();
    if (billingData.billingCycle === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
    } else if (billingData.billingCycle === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
    }
    // For one_time, endDate can be far in future or null

    return this.create({
        subscriptionType: 'user_course',
        userId: new Types.ObjectId(userId),
        courseId: new Types.ObjectId(courseId),
        status: 'active',
        endDate: billingData.billingCycle === 'one_time' ? null : endDate,
        billing: {
            ...billingData,
            nextBillingDate: billingData.billingCycle === 'one_time' ? null : endDate,
            totalPaid: billingData.amount
        },
        features: {
            downloadAccess: true,
            certificateAccess: true,
            lifetimeUpdates: billingData.billingCycle === 'one_time'
        }
    });
};

SubscriptionSchema.statics.createUserPlanSubscription = function (
    userId: string,
    planId: string,
    billingData: any
) {
    const endDate = new Date();
    if (billingData.billingCycle === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
    } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
    }

    return this.create({
        subscriptionType: 'user_plan',
        userId: new Types.ObjectId(userId),
        planId: new Types.ObjectId(planId),
        status: 'active',
        endDate,
        billing: {
            ...billingData,
            nextBillingDate: endDate,
            totalPaid: billingData.amount
        }
    });
};

// PRE-SAVE MIDDLEWARE
SubscriptionSchema.pre('save', function (next) {
    const now = new Date();

    // Auto-expire subscriptions
    if (this.endDate && this.endDate < now && this.status === 'active') {
        this.status = 'expired';
    }

    // End trial period
    if (this.billing?.isTrialPeriod && this.trialEndDate && this.trialEndDate < now) {
        this.billing.isTrialPeriod = false;
    }

    next();
});

// INDEXES
SubscriptionSchema.index({ organizationId: 1, status: 1 });
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ planId: 1 });
SubscriptionSchema.index({ courseId: 1 });
SubscriptionSchema.index({ subscriptionType: 1, status: 1 });
SubscriptionSchema.index({ endDate: 1 });
SubscriptionSchema.index({ 'billing.nextBillingDate': 1 });
SubscriptionSchema.index({ 'billing.stripeSubscriptionId': 1 });

SubscriptionSchema.set('toJSON', { virtuals: true });
SubscriptionSchema.set('toObject', { virtuals: true });

SubscriptionSchema.plugin(mongoosePaginate);

// ===============================
// USAGE EXAMPLES
// ===============================

/*
// Organization subscribes to a plan
const orgSubscription = await Subscription.createOrganizationSubscription(
    'org123', 
    'plan456', 
    {
        amount: 99.99,
        currency: 'USD',
        billingCycle: 'monthly',
        paymentMethod: 'card'
    }
);

// User subscribes to a specific course
const courseSubscription = await Subscription.createUserCourseSubscription(
    'user123',
    'course456',
    {
        amount: 29.99,
        currency: 'USD',
        billingCycle: 'monthly',
        paymentMethod: 'card'
    }
);

// User buys lifetime access to a course
const lifetimeAccess = await Subscription.createUserCourseSubscription(
    'user123',
    'course789',
    {
        amount: 199.99,
        currency: 'USD',
        billingCycle: 'one_time',
        paymentMethod: 'card'
    }
);

// User subscribes to a personal plan (access to multiple courses)
const userPlanSub = await Subscription.createUserPlanSubscription(
    'user123',
    'premium-plan',
    {
        amount: 49.99,
        currency: 'USD',
        billingCycle: 'monthly',
        paymentMethod: 'card'
    }
);

// Check access
if (subscription.isActive && subscription.hasFeature('downloadAccess')) {
    // Allow download
}

// Organization usage check
if (orgSubscription.canAddUser()) {
    // Can add more users
}
*/