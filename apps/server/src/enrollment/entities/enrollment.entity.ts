import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoosePaginate from "mongoose-paginate-v2"
import { Status } from '../enum/status.enum';
import { AccessType } from '../enum/accessType.enum';
import { SubscriptionDto } from 'src/utils/dto/subscription.dto';
import { SubscriptionTypeDef } from 'src/utils/types/Subscription.interface';

@Schema({ timestamps: true })
export class Enrollment extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
    organizationId: Types.ObjectId;

    @Prop({ required: true, default: Date.now })
    enrolledAt: Date;

    // @Prop()
    // expiresAt: Date;

    @Prop()
    completedAt: Date;

    @Prop({
        enum: AccessType,
        required: true
    })
    accessType: string;

    @Prop({
        type: SubscriptionDto,
        validate: {
            validator: function (this: Enrollment) {
                return (this.accessType !== AccessType.PAID_ONCE && this.accessType !== AccessType.SUBSCRIPTION) || !!this.subscription;
            },
            message: 'subscription is required when AccessType is not ' + AccessType.FREE,
        }
    })
    subscription: SubscriptionTypeDef

    @Prop({ default: 0, min: 0, max: 100 })
    progressPercentage: number;

    @Prop({ default: 0 })
    timeSpentMinutes: number;

    @Prop({ default: Date.now })
    lastAccessedAt: Date;

    @Prop({
        type: {
            completedModules: [{ type: Types.ObjectId, ref: 'Module' }],
            completedLessons: [{ type: Types.ObjectId, ref: 'Lesson' }],
            quizScores: [{
                quizId: { type: Types.ObjectId, ref: 'Quiz' },
                score: Number,
                attempts: Number,
                completedAt: Date
            }]
        },
        default: {}
    })
    progress: {
        completedModules: Types.ObjectId[];
        completedLessons: Types.ObjectId[];
        quizScores: {
            quizId: Types.ObjectId;
            score: number;
            attempts: number;
            completedAt: Date;
        }[];
    };

    @Prop({
        type: {
            issued: Boolean,
            issuedAt: Date,
            certificateUrl: String
        },
        default: {}
    })
    certificate: {
        issued: boolean;
        issuedAt: Date;
        certificateUrl: string;
    };

}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);

EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

EnrollmentSchema.plugin(mongoosePaginate);

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

EnrollmentSchema.virtual("completedModules", {
    ref: "Module",
    localField: "progress.completedModules",
    foreignField: "_id",
    justOne: false
});

EnrollmentSchema.virtual("completedLessons", {
    ref: "Lesson",
    localField: "progress.completedLessons",
    foreignField: "_id",
    justOne: false
});


EnrollmentSchema.set('toJSON', { virtuals: true });
EnrollmentSchema.set('toObject', { virtuals: true });
