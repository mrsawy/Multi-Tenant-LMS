export enum ReviewType {
    COURSE = 'COURSE',
    INSTRUCTOR = 'INSTRUCTOR',
    ORGANIZATION = 'ORGANIZATION',
    MODULE = 'MODULE',
    CONTENT = 'CONTENT',
}

export interface CreateReviewInput {
    reviewType: ReviewType;
    rating: number;
    comment?: string;
    courseId?: string;
    moduleId?: string;
    contentId?: string;
    instructorId?: string;
    reviewedOrganizationId?: string;
    userId?: string;
}
