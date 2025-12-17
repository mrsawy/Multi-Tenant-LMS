import * as yup from "yup";

export const createEnrollmentSchema = yup.object({
    course: yup
        .string().required("Course is required"),
    user: yup
        .string().required("User is required")
})

export type CreateEnrollmentSchema = yup.InferType<typeof createEnrollmentSchema>;
