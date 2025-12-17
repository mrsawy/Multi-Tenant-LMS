import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { Currency } from 'src/payment/enums/currency.enum';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';

@Schema({ _id: false }) // Don't create _id for subdocuments
export class PricingDetails {
  @Prop({ type: Number, required: true })
  originalPrice: number;

  @Prop({ type: String, default: 'EGP', enum: Object.values(Currency) })
  originalCurrency: string;

  @Prop({ type: Number })
  priceUSD: number;

  @Prop({ type: Date })
  discountEndDate?: Date;

  @Prop({ type: Date })
  discountStartDate?: Date;

  @Prop({ type: Number, min: 0, max: 100 })
  discountPercentage?: number;
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

  // @Prop({ type: Number, default: 0 })
  // completionRate: number;
}

@Schema({ timestamps: true, discriminatorKey: 'type' })
export class Course extends Document<Types.ObjectId> {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: 'Organization',
  })
  organizationId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, required: true, ref: 'User', refPath: 'username' })
  createdBy: string;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Category' })
  categoriesIds: Types.ObjectId[];

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'CourseModule',
    default: [],
  })
  modulesIds: Types.ObjectId[];

  @Prop({ type: Boolean, default: false })
  isPaid: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  instructorId: Types.ObjectId;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'User' })
  coInstructorsIds: Types.ObjectId[];

  @Prop()
  description: string;

  @Prop()
  shortDescription: string;

  @Prop({ type: [String], required: false })
  learningObjectives: string[];

  @Prop({ type: String, required: true })
  thumbnailKey: string;

  // @Prop({ type: String })
  // trailer: string;

  // Use the proper schema for pricing
  // Note: At least one of monthly, yearly, or one-time pricing must be provided only if isPaid is true
  @Prop({
    type: PricingSchema,
    required: function () {
      return this.isPaid;
    },
    validate: {
      validator: function (pricing: PricingSchema) {
        // If isPaid is false, pricing is not required
        if (!this.isPaid) {
          return true;
        }
        // If isPaid is true, ensure at least one pricing option is available
        return !!(
          pricing &&
          (pricing[BillingCycle.MONTHLY] ||
            pricing[BillingCycle.YEARLY] ||
            pricing[BillingCycle.ONE_TIME])
        );
      },
      message:
        'At least one pricing option (monthly, yearly, or one-time) must be provided when isPaid is true',
    },
  })
  pricing: PricingSchema;

  // Use the proper schema for settings
  @Prop({ type: SettingsSchema, default: {} })
  settings: SettingsSchema;

  // Use the proper schema for stats
  @Prop({ type: StatsSchema, default: {} })
  stats: StatsSchema;

  @Prop({ type: String, required: false })
  paypalPlanId: string;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

CourseSchema.virtual('modules', {
  ref: 'CourseModule',
  localField: 'modulesIds',
  foreignField: '_id',
  justOne: false,
});
CourseSchema.virtual('organization', {
  ref: 'Organization',
  localField: 'organizationId',
  foreignField: '_id',
  justOne: true,
});
CourseSchema.virtual('creator', {
  ref: 'User',
  localField: 'createdBy',
  foreignField: 'username',
  justOne: true,
});
CourseSchema.virtual('instructor', {
  ref: 'User',
  localField: 'instructorId',
  foreignField: '_id',
  justOne: true,
});
CourseSchema.virtual('coInstructors', {
  ref: 'User',
  localField: 'coInstructorsIds',
  foreignField: '_id',
  justOne: false,
});
CourseSchema.virtual('modules', {
  ref: 'CourseModule',
  localField: 'modulesIds',
  foreignField: '_id',
  justOne: false,
});

CourseSchema.virtual('categories', {
  ref: 'Category',
  localField: 'categoriesIds',
  foreignField: '_id',
  justOne: false,
});

CourseSchema.set('toJSON', { virtuals: true });
CourseSchema.set('toObject', { virtuals: true });

CourseSchema.plugin(mongoosePaginate);

// Create schemas for sub-documents
export const PricingSchemaFactory = SchemaFactory.createForClass(PricingSchema);
export const SettingsSchemaFactory =
  SchemaFactory.createForClass(SettingsSchema);
export const StatsSchemaFactory = SchemaFactory.createForClass(StatsSchema);
