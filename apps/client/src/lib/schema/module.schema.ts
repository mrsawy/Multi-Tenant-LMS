import * as yup from "yup";

export const createModuleSchema = yup.object({
    //   courseId: yup.string().required("Course ID is required"),
    title: yup.string().required("Title is required").max(200, "Title must be less than 200 characters"),
    description: yup.string().optional().default(undefined),
    learningObjectives: yup.array().of(yup.string().required()).default([])
});

export const updateModuleSchema = yup.object({
    title: yup.string().max(200, "Title must be less than 200 characters").optional(),
    description: yup.string().optional(),
    learningObjectives: yup.array().of(yup.string()).optional(),
});

export const reorderModulesSchema = yup.object({
    newOrder: yup.array().of(yup.string()).required(),
});

export type CreateModuleSchema = yup.InferType<typeof createModuleSchema>;
export type UpdateModuleSchema = yup.InferType<typeof updateModuleSchema>;
export type ReorderModulesSchema = yup.InferType<typeof reorderModulesSchema>;

