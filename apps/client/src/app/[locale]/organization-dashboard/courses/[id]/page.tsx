import { getCourse } from "@/lib/actions/courses/getCourse.action";

import { ICourse, ICourseWithModules } from "@/lib/types/course/course.interface";
import { notFound } from "next/navigation";
import { getCourseWithModules } from "@/lib/actions/courses/modules.action";

import { getAllFlatCategories } from "@/lib/actions/category/category.action";
import { ICategory } from "@/lib/types/category/ICategory";
import { Paginated } from "@/lib/types/Paginated";
import CourseForm from "../__components/course-form";
import { getUsersByOrganization } from '@/lib/actions/user/getUsersByOrganization.action';
import { Roles } from '@/lib/types/user/roles.enum'


export default async function UpdateCoursePage({ params }: { params: Promise<{ id: string, locale: string }> }) {
    const courseId = (await params).id;


    try {
        const instructors = await getUsersByOrganization({ page: 1, limit: 100 }, { roleName: Roles.INSTRUCTOR });

        const response = await getCourseWithModules(courseId);
        const course = response as ICourseWithModules;
        const flatCategories = (await getAllFlatCategories({ limit: 100, page: 1 })) as Paginated<ICategory>;


        console.log({ flatCategories })
        if (!course) {
            notFound();
        }

        return (
            <div className="flex flex-1 flex-col p-5">
                <CourseForm mode="update" course={course} courseId={courseId} flatCategories={flatCategories.docs} instructors={instructors.docs}/>
            </div>
        );
    } catch (error) {
        console.error('Failed to fetch course:', error);
        notFound();
    }
}
