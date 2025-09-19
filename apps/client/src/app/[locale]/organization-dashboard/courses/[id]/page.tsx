import { getCourse } from "@/lib/actions/courses/getCourse.action";

import { ICourse, ICourseWithModules } from "@/lib/types/course/course.interface";
import { notFound } from "next/navigation";
import { getCourseWithModules } from "@/lib/actions/courses/modules.action";
import UpdateCourseForm from "../__components/update-course-form";


export default async function UpdateCoursePage({ params }: { params: Promise<{ id: string, locale: string }> }) {
    const courseId = (await params).id;
    
    try {
        const response = await getCourseWithModules(courseId);
        const course = response as ICourseWithModules;

        if (!course) {
            notFound();
        }

        return (
            <div className="flex flex-1 flex-col p-5">
                <UpdateCourseForm course={course} courseId={courseId} />
            </div>
        );
    } catch (error) {
        console.error('Failed to fetch course:', error);
        notFound();
    }
}
