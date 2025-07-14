import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { PricingType } from '../enum/pricingType.enum';
import { Difficulty } from '../enum/difficulty.enum';

@Schema({ timestamps: true })
export class Course extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Organization' })
    organizationId: Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true, unique: true })
    slug: string;

    @Prop()
    description: string;

    @Prop()
    shortDescription: string;

    @Prop()
    thumbnail: string;

    @Prop()
    trailer: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
    categoryId: Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    instructorId: Types.ObjectId;

    @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'User' })
    coInstructors: Types.ObjectId[];

    @Prop({
        type: {
            type: { type: String, enum: PricingType, required: true },
            price: Number,
            currency: String,
            discountPrice: Number,
            discountEndDate: Date,
        },
    })
    pricing: {
        type: string;
        price?: number;
        currency?: string;
        discountPrice?: number;
        discountEndDate?: Date;
    };

    @Prop({
        type: {
            level: { type: String, enum: Difficulty },
            duration: Number,
            language: String,
            // subtitles: [String],
            requirements: [String],
            whatYouWillLearn: [String],
            tags: [String],
        },
    })
    content: {
        level: string;
        duration: number;
        language: string;
        // subtitles: string[];
        requirements: string[];
        whatYouWillLearn: string[];
        tags: string[];
    };

    @Prop({
        type: {
            isPublished: Boolean,
            isDraft: Boolean,
            enrollmentLimit: Number,
            enrollmentDeadline: Date,
            certificateEnabled: Boolean,
            discussionEnabled: Boolean,
            downloadEnabled: Boolean,
        },
    })
    settings: {
        isPublished: boolean;
        isDraft: boolean;
        enrollmentLimit: number;
        enrollmentDeadline: Date;
        certificateEnabled: boolean;
        discussionEnabled: boolean;
        downloadEnabled: boolean;
    };

    @Prop({
        type: {
            totalEnrollments: Number,
            totalRatings: Number,
            averageRating: Number,
            totalViews: Number,
            completionRate: Number,
        },
        default: {},
    })
    stats: {
        totalEnrollments: number;
        totalRatings: number;
        averageRating: number;
        totalViews: number;
        completionRate: number;
    };

    @Prop()
    publishedAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
