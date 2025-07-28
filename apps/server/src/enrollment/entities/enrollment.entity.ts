import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoosePaginate from "mongoose-paginate-v2"
import { Status } from '../enum/status.enum';
import { AccessType } from '../enum/accessType.enum';
import { BillingCycle } from '../enum/billingCycle.enum';

@Schema({ timestamps: true })
export class Enrollment extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
    organizationId: Types.ObjectId;

    @Prop({ enum: Status, default: 'active' })
    status: string;

    @Prop({ required: true, default: Date.now })
    enrolledAt: Date;

    @Prop()
    expiresAt: Date; // When access expires (for subscriptions/trials)

    @Prop()
    completedAt: Date;

    // ACCESS TYPE - How user got access to this course
    @Prop({
        enum: AccessType,
        required: true
    })
    accessType: string;

    // PAYMENT & BILLING INFO
    @Prop()
    billing: {
        // One-time payment
        totalPaid?: number;
        currency?: string;
        paymentDate?: Date;
        transactionId?: string;
        stripePaymentId?: string;

        // Subscription billing
        recurringAmount?: number; // Monthly/yearly amount
        billingCycle?: BillingCycle;
        nextBillingDate?: Date;
        subscriptionStartDate?: Date;

        // Trial info
        isTrialPeriod?: boolean;
        trialEndsAt?: Date;

        // Cancellation
        cancelledAt?: Date;
        cancellationReason?: string;
        refundAmount?: number;
    };

    // LEARNING PROGRESS
    @Prop({ default: 0, min: 0, max: 100 })
    progressPercentage: number;

    @Prop({ default: 0 })
    timeSpentMinutes: number;

    @Prop()
    lastAccessedAt: Date;

    @Prop()
    progress: {
        completedModules: [Types.ObjectId];
        completedLessons: [Types.ObjectId];
        quizScores: [{
            quizId: Types.ObjectId;
            score: number;
            attempts: number;
            completedAt: Date;
        }];
    };

    // CERTIFICATE
    @Prop()
    certificate: {
        issued: boolean;
        issuedAt: Date;
        certificateUrl: string;
    };

    // ACCESS PERMISSIONS - What user can do
    @Prop()
    permissions: {
        canViewContent: boolean;
        canDownloadMaterials: boolean;
        canTakeQuizzes: boolean;
        canReceiveCertificate: boolean;
        hasLifetimeAccess: boolean;
    };

    // SUBSCRIPTION RENEWALS HISTORY
    @Prop()
    renewalHistory: [{
        renewedAt: Date;
        amount: number;
        nextExpiryDate: Date;
        billingCycle: string;
        transactionId: string;
    }];
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);

// VIRTUALS
EnrollmentSchema.virtual("user", {
    ref: "User",
    localField: "userId",
    foreignField: "_id",
    justOne: true
});

EnrollmentSchema.virtual("course", {
    ref: "Course",
    localField: "courseId",
    foreignField: "_id",
    justOne: true
});

EnrollmentSchema.virtual("organization", {
    ref: "Organization",
    localField: "organizationId",
    foreignField: "_id",
    justOne: true
});

// COMPUTED PROPERTIES
EnrollmentSchema.virtual('isActive').get(function () {
    if (this.status !== Status.ACTIVE) return false;

    // Check if expired
    if (this.expiresAt && this.expiresAt < new Date()) {
        return false;
    }

    // Check if trial expired
    if (this.billing?.isTrialPeriod && this.billing?.trialEndsAt && this.billing.trialEndsAt < new Date()) {
        return false;
    }

    return true;
});


EnrollmentSchema.virtual('daysUntilExpiry').get(function () {
    if (!this.expiresAt) return null;

    const now = new Date();
    const diffTime = this.expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
});

// // METHODS
// EnrollmentSchema.methods.hasPermission = function (permission: string): boolean {
//     if (!this.isActive) return false;

//     return this.permissions?.[permission] || false;
// };

// EnrollmentSchema.methods.renewSubscription = function (billingCycle: 'monthly' | 'yearly', amount: number, transactionId: string) {
//     const now = new Date();
//     const newExpiryDate = new Date();

//     // Calculate new expiry date
//     if (billingCycle === 'monthly') {
//         newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
//     } else {
//         newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
//     }

//     // Update enrollment
//     this.expiresAt = newExpiryDate;
//     this.status = 'active';
//     this.billing = this.billing || {};
//     this.billing.nextBillingDate = newExpiryDate;
//     this.billing.recurringAmount = amount;
//     this.billing.billingCycle = billingCycle;

//     // Add to renewal history
//     if (!this.renewalHistory) this.renewalHistory = [];
//     this.renewalHistory.push({
//         renewedAt: now,
//         amount,
//         nextExpiryDate: newExpiryDate,
//         billingCycle,
//         transactionId
//     });
// };

// EnrollmentSchema.methods.cancelSubscription = function (reason?: string) {
//     this.status = 'cancelled';
//     this.billing = this.billing || {};
//     this.billing.cancelledAt = new Date();
//     this.billing.cancellationReason = reason;
//     this.billing.nextBillingDate = null;
// };

// EnrollmentSchema.methods.completePayment = function (amount: number, transactionId: string, currency = 'USD') {
//     this.billing = this.billing || {};
//     this.billing.totalPaid = (this.billing.totalPaid || 0) + amount;
//     this.billing.currency = currency;
//     this.billing.paymentDate = new Date();
//     this.billing.transactionId = transactionId;
//     this.status = 'active';

//     // Set permissions based on payment
//     this.permissions = {
//         canViewContent: true,
//         canDownloadMaterials: true,
//         canTakeQuizzes: true,
//         canReceiveCertificate: true,
//         hasLifetimeAccess: this.accessType === 'paid_once'
//     };
// };

// // STATIC METHODS
// EnrollmentSchema.statics.createFreeEnrollment = function (userId: string, courseId: string, organizationId: string) {
//     return this.create({
//         userId,
//         courseId,
//         organizationId,
//         accessType: 'free',
//         status: 'active',
//         permissions: {
//             canViewContent: true,
//             canDownloadMaterials: false,
//             canTakeQuizzes: true,
//             canReceiveCertificate: false,
//             hasLifetimeAccess: false
//         }
//     });
// };

// EnrollmentSchema.statics.createPaidEnrollment = function (
//     userId: string,
//     courseId: string,
//     organizationId: string,
//     amount: number,
//     transactionId: string
// ) {
//     return this.create({
//         userId,
//         courseId,
//         organizationId,
//         accessType: 'paid_once',
//         status: 'active',
//         billing: {
//             totalPaid: amount,
//             currency: 'USD',
//             paymentDate: new Date(),
//             transactionId
//         },
//         permissions: {
//             canViewContent: true,
//             canDownloadMaterials: true,
//             canTakeQuizzes: true,
//             canReceiveCertificate: true,
//             hasLifetimeAccess: true
//         }
//     });
// };

// EnrollmentSchema.statics.createSubscriptionEnrollment = function (
//     userId: string,
//     courseId: string,
//     organizationId: string,
//     billingCycle: 'monthly' | 'yearly',
//     amount: number,
//     transactionId: string
// ) {
//     const expiryDate = new Date();
//     if (billingCycle === 'monthly') {
//         expiryDate.setMonth(expiryDate.getMonth() + 1);
//     } else {
//         expiryDate.setFullYear(expiryDate.getFullYear() + 1);
//     }

//     return this.create({
//         userId,
//         courseId,
//         organizationId,
//         accessType: 'subscription',
//         status: 'active',
//         expiresAt: expiryDate,
//         billing: {
//             recurringAmount: amount,
//             billingCycle,
//             nextBillingDate: expiryDate,
//             subscriptionStartDate: new Date(),
//             totalPaid: amount,
//             paymentDate: new Date(),
//             transactionId
//         },
//         permissions: {
//             canViewContent: true,
//             canDownloadMaterials: true,
//             canTakeQuizzes: true,
//             canReceiveCertificate: true,
//             hasLifetimeAccess: false
//         }
//     });
// };

// EnrollmentSchema.statics.createTrialEnrollment = function (
//     userId: string,
//     courseId: string,
//     organizationId: string,
//     trialDays = 7
// ) {
//     const trialEndDate = new Date();
//     trialEndDate.setDate(trialEndDate.getDate() + trialDays);

//     return this.create({
//         userId,
//         courseId,
//         organizationId,
//         accessType: 'subscription',
//         status: 'active',
//         expiresAt: trialEndDate,
//         billing: {
//             isTrialPeriod: true,
//             trialEndsAt: trialEndDate,
//             totalPaid: 0
//         },
//         permissions: {
//             canViewContent: true,
//             canDownloadMaterials: false,
//             canTakeQuizzes: true,
//             canReceiveCertificate: false,
//             hasLifetimeAccess: false
//         }
//     });
// };

// EnrollmentSchema.statics.createOrganizationEnrollment = function (
//     userId: string,
//     courseId: string,
//     organizationId: string
// ) {
//     return this.create({
//         userId,
//         courseId,
//         organizationId,
//         accessType: 'organization',
//         status: 'active',
//         billing: {
//             totalPaid: 0 // Paid by organization
//         },
//         permissions: {
//             canViewContent: true,
//             canDownloadMaterials: true,
//             canTakeQuizzes: true,
//             canReceiveCertificate: true,
//             hasLifetimeAccess: false
//         }
//     });
// };

// // PRE-SAVE MIDDLEWARE
// EnrollmentSchema.pre('save', function (next) {
//     // Auto-expire enrollments
//     if (this.expiresAt && this.expiresAt < new Date() && this.status === 'active') {
//         this.status = 'expired';
//     }

//     // Update last accessed
//     if (this.isModified('progress') || this.isModified('progressPercentage')) {
//         this.lastAccessedAt = new Date();
//     }

//     next();
// });

// INDEXES
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
EnrollmentSchema.index({ organizationId: 1 });
EnrollmentSchema.index({ status: 1 });
EnrollmentSchema.index({ accessType: 1 });
EnrollmentSchema.index({ expiresAt: 1 });
EnrollmentSchema.index({ 'billing.nextBillingDate': 1 });

EnrollmentSchema.set('toJSON', { virtuals: true });
EnrollmentSchema.set('toObject', { virtuals: true });

EnrollmentSchema.plugin(mongoosePaginate);