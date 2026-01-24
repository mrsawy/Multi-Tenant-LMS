"use client";

import React from 'react';
import { SidebarProvider } from '@/components/atoms/sidebar';
import { ICourseOverview } from '@/lib/types/course/course.interface';
import { IEnrollment } from '@/lib/types/enrollment/enrollment.interface';
import { IUser } from '@/lib/types/user/user.interface';
import { CourseContentSidebarWrapper } from '../__components/course-content-sidebar-wrapper';
import { SidebarInset } from '@/components/atoms/sidebar';
import { usePathname } from 'next/navigation';

interface CourseContentLayoutClientProps {
    children: React.ReactNode;
    course: ICourseOverview;
    enrollment: IEnrollment;
    user?: IUser;
}

export default function CourseContentLayoutClient({
    children,
    course,
    enrollment,
    user,
}: CourseContentLayoutClientProps) {
    const pathname = usePathname();

    // Extract contentId from pathname: /student-dashboard/courses/[id]/[contentId]
    const pathParts = pathname?.split('/') || [];
    const coursesIndex = pathParts.findIndex(part => part === 'courses');
    const currentContentId = coursesIndex >= 0 && pathParts[coursesIndex + 2] && pathParts[coursesIndex + 2] !== enrollment._id
        ? pathParts[coursesIndex + 2]
        : undefined;

    return (
        <SidebarProvider
            style={{
                '--sidebar-width': 'calc(var(--spacing) * 72)',
            } as React.CSSProperties}
        >
            <SidebarInset>
                {children}
            </SidebarInset>
            <CourseContentSidebarWrapper
                course={course}
                enrollment={enrollment}
                currentContentId={currentContentId}
                user={user}
            />
        </SidebarProvider>
    );
}
