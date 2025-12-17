import { getCourses } from "@/lib/actions/courses/getCourses.action";
import CourseDataTable from "./__components/course-data-table";
import { ICourse } from "@/lib/types/course/course.interface";

export default async function CoursePage() {
    try {
        const response = await getCourses()
        const courses = Array.isArray(response.docs) ? response.docs : [];
        
        return (
            <div className="p-4">
                <h1 className="text-2xl font-semibold mb-4">Courses Management</h1>
                <CourseDataTable courses={courses} />
            </div>
        )
    } catch (error) {
        console.error('Failed to fetch courses:', error)
        return (
            <div className="p-4">
                <h1 className="text-2xl font-semibold mb-4">Courses Management</h1>
                <CourseDataTable courses={[]} />
            </div>
        )
    }
}