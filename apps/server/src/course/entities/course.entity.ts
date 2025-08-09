import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import * as mongoosePaginate from "mongoose-paginate-v2";
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';
@Schema({ _id: false }) // Don't create _id for subdocuments
export class PricingDetails {
    @Prop({ type: Number, required: true })
    price: number;

    @Prop({ type: String, default: 'EGP' })
    currency?: string;

    @Prop({ type: Number })
    discountPrice?: number;

    @Prop({ type: Date })
    discountEndDate?: Date;
}

@Schema({ _id: false })
export class PricingSchema {
    @Prop({ type: PricingDetails, required: false })
    [BillingCycle.MONTHLY]?: PricingDetails;

    @Prop({ type: PricingDetails, required: false })
    [BillingCycle.YEARLY]?: PricingDetails;

    @Prop({ type: PricingDetails, required: false })
    [BillingCycle.ONE_TIME]?: PricingDetails;
}

// Define the settings subdocument schema
@Schema({ _id: false })
export class SettingsSchema {
    @Prop({ type: Boolean, default: false })
    isPublished: boolean;

    @Prop({ type: Boolean, default: true })
    isDraft: boolean;

    @Prop({ type: Number })
    enrollmentLimit?: number;

    @Prop({ type: Date })
    enrollmentDeadline?: Date;

    @Prop({ type: Boolean, default: false })
    certificateEnabled: boolean;

    @Prop({ type: Boolean, default: true })
    discussionEnabled: boolean;

    @Prop({ type: Boolean, default: false })
    downloadEnabled: boolean;
}

// Define the stats subdocument schema
@Schema({ _id: false })
export class StatsSchema {
    @Prop({ type: Number, default: 0 })
    totalEnrollments: number;

    @Prop({ type: Number, default: 0 })
    totalRatings: number;

    @Prop({ type: Number, default: 0 })
    averageRating: number;

    @Prop({ type: Number, default: 0 })
    totalViews: number;

    @Prop({ type: Number, default: 0 })
    completionRate: number;
}

@Schema({ timestamps: true, discriminatorKey: 'type' })
export class Course extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Organization' })
    organization: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ type: String, required: true, ref: 'User', refPath: 'username' })
    createdBy: string;

    @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Category' })
    categories: Types.ObjectId[];

    @Prop({ type: Boolean, required: true })
    isPaid: boolean

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    instructor: Types.ObjectId;

    @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'User' })
    coInstructors: Types.ObjectId[];

    @Prop()
    description: string;

    @Prop()
    shortDescription: string;

    @Prop({ type: String })
    thumbnail: string;

    @Prop({ type: String })
    trailer: string;

    // Use the proper schema for pricing
    @Prop({ type: PricingSchema, required: true })
    pricing: PricingSchema;

    // Use the proper schema for settings
    @Prop({ type: SettingsSchema, default: {} })
    settings: SettingsSchema;

    // Use the proper schema for stats
    @Prop({ type: StatsSchema, default: {} })
    stats: StatsSchema;

    @Prop()
    publishedAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

CourseSchema.virtual('creator', { ref: 'User', localField: 'createdBy', foreignField: 'username', justOne: true });

CourseSchema.set('toJSON', { virtuals: true });
CourseSchema.set('toObject', { virtuals: true });


CourseSchema.plugin(mongoosePaginate)

// Create schemas for sub-documents
export const PricingSchemaFactory = SchemaFactory.createForClass(PricingSchema);
export const SettingsSchemaFactory = SchemaFactory.createForClass(SettingsSchema);
export const StatsSchemaFactory = SchemaFactory.createForClass(StatsSchema);