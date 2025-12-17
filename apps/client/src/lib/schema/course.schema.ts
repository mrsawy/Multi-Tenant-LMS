import * as Yup from 'yup';
import { InferType } from "yup";
import { Currency } from '../data/currency.enum';
import { BillingCycle } from '../types/course/enum/BillingCycle.enum';



// Pricing details schema
export const pricingDetailsSchema = Yup.object().shape({
    originalPrice: Yup.number()
        .min(0, 'Price must be greater than or equal to 0')
        .optional()
        .nullable(),

    originalCurrency: Yup.string()
        .oneOf(Object.values(Currency), 'Invalid currency')
        .nullable()
        .when('originalPrice', {
            is: (price: number | null | undefined) => price == null, // no price
            then: (schema) =>
                schema.test(
                    'currency-requires-price',
                    'Currency cannot be set without a price',
                    (val) => val == null

                ), // must be null if no price
        }),

    discountEndDate: Yup.date().optional().nullable(),
    discountStartDate: Yup.date().optional().nullable(),
    discountPercentage: Yup.number()
        .min(0, 'Discount percentage must be at least 0')
        .max(100, 'Discount percentage cannot exceed 100')
        .optional()
        .nullable(),
});

// Pricing schema
export const pricingSchema = Yup.object().shape({
    [BillingCycle.MONTHLY]: pricingDetailsSchema.optional(),
    [BillingCycle.YEARLY]: pricingDetailsSchema.optional(),
    [BillingCycle.ONE_TIME]: pricingDetailsSchema.optional(),
});

// Settings schema
export const settingsSchema = Yup.object().shape({
    isPublished: Yup.boolean().optional(),
    isDraft: Yup.boolean().optional(),
    enrollmentLimit: Yup.number()
        .typeError('enrollment limit must be valid number')
        .min(1, 'Enrollment limit must be at least 1')
        .optional()
        .nullable(),
    enrollmentDeadline: Yup.date()
        .optional()
        .nullable(),
    certificateEnabled: Yup.boolean().optional(),
    discussionEnabled: Yup.boolean().optional(),
    downloadEnabled: Yup.boolean().optional(),
});

// Create course schema
export const createCourseSchema = Yup.object().shape({

    instructorId: Yup.string()
        .optional()
        .nullable(),

    coInstructorsIds: Yup.array().of(Yup.string()).optional(),
    name: Yup.string()
        .required('Course name is required')
        .min(3, 'Course name must be at least 3 characters')
        .max(100, 'Course name must be less than 100 characters'),

    description: Yup.string()
        .optional()
        .nullable(),

    shortDescription: Yup.string()
        .max(500, 'Short description must be less than 500 characters')
        .optional()
        .nullable(),

    categoriesIds: Yup.array()
        .of(Yup.string().required())
        .optional(),

    // modulesIds: Yup.array()
    //     .of(Yup.string().required())
    //     .optional(),

    instructor: Yup.string()
        .optional()
        .nullable(),

    pricing: Yup.object().when('isPaid', {
        is: true,
        then: (schema) => schema
            .concat(pricingSchema)
            .test('at-least-one-pricing', 'At least one pricing option must be provided', function (value) {
                const { MONTHLY, YEARLY, ONE_TIME } = BillingCycle;
                const hasAtLeastOne = [MONTHLY, YEARLY, ONE_TIME].some((cycle) => {
                    return value?.[cycle]?.originalPrice != null && value?.[cycle]?.originalCurrency;
                });
                return hasAtLeastOne;
            })
            .required('Pricing is required for paid courses'),
        otherwise: (schema) => schema.optional(),
    }),

    isPaid: Yup.boolean()
        .required('Please specify if the course is paid or free'),

    coInstructors: Yup.array()
        .of(Yup.string().required())
        .optional(),

    thumbnail: Yup.mixed<File>()
        .test('fileType', 'Only image files are allowed', (value) => {
            if (!value) return true; // Allow null or optional
            return ['image/jpeg', 'image/png', 'image/webp'].includes(value.type);
        })
        .nullable()
        .optional(),


    thumbnailKey: Yup.string().optional(),

    trailer: Yup.string()
        .url('Please enter a valid URL for trailer')
        .optional()
        .nullable(),

    settings: settingsSchema.optional(),
    learningObjectives: Yup.array().of(Yup.string().required()).optional()

    // categories: Yup.array().of(Yup.string().required()).optional(),
});

// Update course schema (all fields optional)
export const updateCourseSchema = createCourseSchema.partial();

// Type exports
export type PricingDetails = InferType<typeof pricingDetailsSchema>;
export type Pricing = InferType<typeof pricingSchema>;
export type Settings = InferType<typeof settingsSchema>;
export type CreateCourseSchema = InferType<typeof createCourseSchema>;
export type UpdateCourseSchema = InferType<typeof updateCourseSchema>;
