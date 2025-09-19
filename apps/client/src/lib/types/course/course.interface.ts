import { Types } from 'mongoose';
import { BillingCycle } from './enum/BillingCycle.enum';
import { Currency } from '@/lib/data/currency.enum';
import { IModule } from "./modules.interface";

// ----- Subdocuments -----

export interface PricingDetails {
    originalPrice: number; // Typo in schema? Should be originalPrice?
    originalCurrency: Currency; // EGP, USD, etc.
    priceUSD?: number;
    discountEndDate?: Date;
    discountStartDate?: Date;
    discountPercentage?: number; // 0-100
}

export interface PricingSchema {
    [BillingCycle.MONTHLY]?: PricingDetails;
    [BillingCycle.YEARLY]?: PricingDetails;
    [BillingCycle.ONE_TIME]?: PricingDetails;
}

export interface SettingsSchema {
    isPublished: boolean;
    isDraft: boolean;
    enrollmentLimit?: number;
    enrollmentDeadline?: Date;
    certificateEnabled: boolean;
    discussionEnabled: boolean;
    downloadEnabled: boolean;
}

export interface StatsSchema {
    totalEnrollments: number;
    totalRatings: number;
    averageRating: number;
    totalViews: number;
    completionRate: number;
}

// ----- Main Course Interface -----

export interface ICourse {
    _id?: Types.ObjectId;
    organizationId: Types.ObjectId;

    name: string;

    createdBy: string; // username (refPath)
    instructorId?: Types.ObjectId;
    coInstructors?: Types.ObjectId[];

    categories?: Types.ObjectId[];
    modulesIds?: Types.ObjectId[];

    isPaid: boolean;

    description?: string;
    shortDescription?: string;

    thumbnailKey?: string;
    trailer?: string;

    pricing: PricingSchema;
    settings?: SettingsSchema;
    stats?: StatsSchema;

    publishedAt?: Date;
    paypalPlanId?: string;

    createdAt?: Date;
    updatedAt?: Date;
}



export interface ICourseWithModules extends ICourse {
    modules: IModule[]
}

// export interface ICourseWithContents 