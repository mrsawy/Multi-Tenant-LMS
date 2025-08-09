import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoosePaginate from "mongoose-paginate-v2"
import { SubscriptionType } from '../enum/subscriptionType.enum';
import { SubscriptionStatus } from '../enum/subscriptionStatus.enum';
import { BillingCycle } from '../../utils/enums/billingCycle.enum';

@Schema({ timestamps: true })
export class Subscription extends Document {

    @Prop({
        enum: SubscriptionType,
        required: true
    })
    subscriptionType: string;

    @Prop({
        type: Types.ObjectId, ref: 'Organization',
        validate: {
            validator: function (this: Subscription) {
                return this.subscriptionType !== SubscriptionType.ORGANIZATION_PLAN || !!this.organizationId;
            },
            message: 'organizationId is required when subscriptionType is ' + SubscriptionType.ORGANIZATION_PLAN,
        }
    })
    organizationId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId, ref: 'Course',
        validate: {
            validator: function (this: Subscription) {
                return this.subscriptionType !== SubscriptionType.USER_COURSE || !!this.courseId;
            },
            message: 'courseId is required when subscriptionType is ' + SubscriptionType.USER_COURSE,
        }
    })
    courseId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId, ref: 'Plan',

        validate: {
            validator: function (this: Subscription) {
                return this.subscriptionType !== SubscriptionType.ORGANIZATION_PLAN || !!this.planId;
            },
            message: 'planId is required when subscriptionType is ' + SubscriptionType.ORGANIZATION_PLAN,
        }
    })
    planId: Types.ObjectId;

    @Prop({ enum: SubscriptionStatus, default: 'active' })
    status: string;

    @Prop({ required: true, default: Date.now })
    startDate: Date;

    @Prop({ required: true })
    endDate: Date;

    @Prop()
    cancelledAt: Date;

    @Prop()
    suspendedAt: Date;

    // BILLING INFORMATION
    @Prop({
        type: {
            amount: { type: Number, required: true },
            currency: { type: String, required: true },
            billingCycle: { type: String, enum: Object.values(BillingCycle), required: true },
            nextBillingDate: { type: Date },
            totalPaid: { type: Number, default: 0 },
            lastPaymentDate: { type: Date },
            lastPaymentAmount: { type: Number },
            paymentMethod: { type: String }
        },
        required: true
    })
    billing: {
        amount: number;
        currency: string;
        billingCycle: BillingCycle;
        nextBillingDate?: Date;
        totalPaid: number;
        lastPaymentDate?: Date;
        lastPaymentAmount?: number;
        paymentMethod?: string;
    };



    @Prop()
    renewalHistory: [{
        renewedAt: Date;
        amount: number;
        billingCycle: BillingCycle;
        endDate: Date;
        transactionId: string;
        paymentMethod: string;
    }];

    @Prop({
        type: {
            reason: { type: String },
            cancelledBy: { type: Types.ObjectId, required: true },
            refundAmount: { type: Number, required: false },
            refundStatus: { type: String, required: false },
            cancelAtPeriodEnd: { type: Date, required: true }
        },
        required: false
    })
    cancellation: {
        reason?: string;
        cancelledBy?: Types.ObjectId; // User who cancelled
        refundAmount?: number;
        refundStatus?: 'pending' | 'completed' | 'rejected';
        cancelAtPeriodEnd?: boolean; // Don't cancel immediately
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
