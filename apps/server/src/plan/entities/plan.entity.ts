import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { BillingCycle } from 'src/utils/enums/billingCycle.enum';

@Schema({ timestamps: true })
export class Plan extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ type: String, required: true })
    description: string;

    // Correctly define price as a nested object with keys based on PlanType
    @Prop({
        type: MongooseSchema.Types.Mixed,
        required: true,
    })
    price: {
        [BillingCycle.MONTHLY]: number;
        [BillingCycle.YEARLY]: number;
        [BillingCycle.ONE_TIME]: number;
    };

    // Use raw type definition for nested object
    @Prop({
        type: {
            maxUsers: { type: Number, required: true },
            maxCourses: { type: Number, required: true },
            maxStorageGB: { type: Number, required: true },
            analytics: { type: Boolean, required: true },
            prioritySupport: { type: Boolean, required: true },
        },
        required: true
    })
    features: {
        maxUsers: number;
        maxCourses: number;
        maxStorageGB: number;
        analytics: boolean;
        prioritySupport: boolean;
    };

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ type: String, required: true })
    tier: string;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
