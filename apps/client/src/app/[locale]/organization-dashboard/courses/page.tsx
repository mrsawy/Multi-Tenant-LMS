import { DataTable } from "@/components/molecules/data-table";
import data from "./data.json"
import { getCourses } from "@/lib/actions/courses/getCourses.action";
import { Button } from "@/components/atoms/button";
import { IconPlus } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";

export default async function CoursePage() {
    try {
        const courses = await getCourses()
        console.log('Courses:', courses)
        return <div className="flex flex-1 flex-col p-5">
            <div className="flex items-center justify-between px-4 lg:px-6">
                <Link href="/organization-dashboard/courses/create" className="ms-auto my-7">
                    <Button >
                        <IconPlus />
                        Add Course
                    </Button>
                </Link>
            </div>
            <DataTable data={[]} />
        </div>
    } catch (error) {
        console.error('Failed to fetch courses:', error)
        return <DataTable data={data} />
    }
}