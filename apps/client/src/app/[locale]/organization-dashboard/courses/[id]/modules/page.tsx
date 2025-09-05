import { getCourseWithModules } from "@/lib/actions/courses/modules.action";
import ModulesManager from "./__components/modules-manager";
import ModulesDataTable from "./__components/module-data-table";
import { ICourseWithModules } from "@/lib/types/course/courseWithModules.interface";

export default async function CourseModulesPage({ params }: { params: Promise<{ id: string, locale: string }> }) {
    const courseId = (await params).id
    const response = await getCourseWithModules(courseId);
    const course = response.data as ICourseWithModules;

    // console.log({ course })
    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold mb-4">{course?.name}</h1>
            <ModulesDataTable course={course} />
            {/* <ModulesManager courseId={courseId} initialModules={course?.modules || []} /> */}
        </div>
    );
}

