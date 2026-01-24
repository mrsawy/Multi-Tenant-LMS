
import { BillingCycle } from './enum/BillingCycle.enum';
import { Currency } from '@/lib/data/currency.enum';
import { IModule, IModuleWithContents } from "./modules.interface";
import { ICategory } from '../category/ICategory';
import { IContent } from './content.interface';
import { IInstructor, IUser } from '../user/user.interface';

// ----- Subdocuments -----

export interface PricingDetails {
    originalPrice: number; // Typo in schema? Should be originalPrice?
    originalCurrency: Currency; // EGP, USD, etc.
    priceUSD: number;
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
    totalReviews: number;
    averageRating: number;
    totalViews: number;
    completionRate: number;
    enrolledStudentsCount: number;
}

export interface TimeSlot {
    _id?: string;
    startTime: string; // Format: HH:MM am/pm (e.g., 02:00 pm)
    endTime: string; // Format: HH:MM am/pm (e.g., 11:30 am)
    dayOfWeek: string; // e.g., Monday, Tuesday, etc.
    instructorsIds?: string[];
    coInstructorsIds?: string[];
    studentsIds?: string[];
}

export interface AttendanceSettings {
    requireAttendance?: boolean;
    offlineSchedule?: TimeSlot[];
}

// ----- Main Course Interface -----

export interface ICourse {
    _id: string;
    organizationId: string;

    name: string;

    createdBy: string; // username (refPath)
    instructorId?: string;
    coInstructorsIds?: string[];
    coInstructors?: IUser[];
    categoriesIds?: string[];
    categories?: ICategory[];
    modulesIds?: string[];

    isPaid: boolean;

    description?: string;
    shortDescription?: string;

    thumbnailKey?: string;
    trailerKey?: string;

    pricing: PricingSchema;
    settings?: SettingsSchema;
    stats?: StatsSchema;
    attendanceSettings?: AttendanceSettings;

    publishedAt?: Date;
    paypalPlanId?: string;

    createdAt: string;
    updatedAt: string;

    instructor?: IInstructor

    learningObjectives: string[]

    duration?: string
    language?: string
}



export interface ICourseWithModules extends ICourse {
    modules: IModule[]
}

export interface ICourseOverview extends ICourse {
    modules: IModuleWithContents[];
}
// export interface ICourseWithContents 