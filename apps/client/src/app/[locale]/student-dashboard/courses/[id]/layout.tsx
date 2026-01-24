import React from 'react';
import { SidebarProvider } from '@/components/atoms/sidebar';
import { createAuthorizedNatsRequest } from '@/lib/utils/createNatsRequest';
import { ICourseOverview } from '@/lib/types/course/course.interface';
import { IEnrollment } from '@/lib/types/enrollment/enrollment.interface';
import { getAuthUser } from '@/lib/actions/user/user.action';
import { CourseContentSidebarWrapper } from '../__components/course-content-sidebar-wrapper';
import { SidebarInset } from '@/components/atoms/sidebar';
import CourseContentLayoutClient from './layout-client';

export const dynamic = "force-dynamic";

interface CourseContentLayoutProps {
    children: React.ReactNode;
    params: Promise<{ id: string; locale: string }>;
}

export default async function CourseContentLayout({
    children,
    params
}: CourseContentLayoutProps) {
    const { id } = await params;

    // Fetch course and enrollment data for the sidebar
    const result = await createAuthorizedNatsRequest("enrollment.getDetailedEnrolledCourse", { enrollmentId: id }) as { data: { course: ICourseOverview, enrollment: IEnrollment } };
    const course = result.data.course;
    const enrollment = result.data.enrollment;
    const user = await getAuthUser();

    return (
        <CourseContentLayoutClient
            course={course}
            enrollment={enrollment}
            user={user}
        >
            {children}
        </CourseContentLayoutClient>
    );
}
