import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoosePaginate from "mongoose-paginate-v2"
import { Status } from '../enum/status.enum';
import { AccessType } from '../enum/accessType.enum';
import { Subscription, SubscriptionSchema } from 'src/subscription/entities/subscription.entity';

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

    @Prop({
        type: SubscriptionSchema,
        validate: {
            validator: function (this: Enrollment) {
                return (this.accessType !== AccessType.PAID_ONCE && this.accessType !== AccessType.SUBSCRIPTION) || !!this.subscription;
            },
            message: 'AccessType is required when AccessType is not ' + AccessType.FREE,
        }
    })
    subscription: Subscription

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

