"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarRail,
} from "@/components/atoms/sidebar";
import { useLocale } from "next-intl";
import { CourseContentSidebar } from "./course-content-sidebar";
import { ICourseOverview } from "@/lib/types/course/course.interface";
import { IEnrollment } from "@/lib/types/enrollment/enrollment.interface";
import { IUser } from "@/lib/types/user/user.interface";
import { usePathname } from "next/navigation";

interface CourseContentSidebarWrapperProps {
    course: ICourseOverview;
    enrollment: IEnrollment;
    currentContentId?: string;
    user?: IUser;
}

export function CourseContentSidebarWrapper({
    course,
    enrollment,
    currentContentId,
    user,
}: CourseContentSidebarWrapperProps) {
    const locale = useLocale();
    const isRTL = locale === 'ar';
    const pathname = usePathname();

    // Extract contentId from pathname if not provided
    const contentIdFromPath = pathname?.split('/').pop();
    const activeContentId = currentContentId || (contentIdFromPath && contentIdFromPath !== enrollment._id ? contentIdFromPath : undefined);

    return (
        <Sidebar
            collapsible="offcanvas"
            variant="inset"
            side={isRTL ? 'left' : 'right'} // Opposite side of the main sidebar
            className="bg-white dark:bg-slate-900 p-0 m-2 me-0 rounded-s-2xl border overflow-hidden"
        >
            <SidebarContent className="p-0 overflow-hidden">
                <CourseContentSidebar
                    course={course}
                    enrollment={enrollment}
                    currentContentId={activeContentId}
                    user={user}
                />
            </SidebarContent>
        </Sidebar>
    );
}
