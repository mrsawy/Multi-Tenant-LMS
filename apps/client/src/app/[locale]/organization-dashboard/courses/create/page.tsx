import { getAllFlatCategories } from "@/lib/actions/category/category.action";
import CourseForm from "../__components/course-form";
import { Paginated } from "@/lib/types/Paginated";
import { ICategory } from "@/lib/types/category/ICategory";
import { getUsersByOrganization } from "@/lib/actions/user/getUsersByOrganization.action";
import { Roles } from "@/lib/types/user/roles.enum";


export default async function CreateCoursePage() {
    const flatCategories = (await getAllFlatCategories({ limit: 100, page: 1 })) as Paginated<ICategory>;
    const instructors = await getUsersByOrganization({ page: 1, limit: 100 }, { roleName: Roles.INSTRUCTOR });

    return (
        <div className="flex flex-1 flex-col p-5">
            <CourseForm mode="create" flatCategories={flatCategories.docs} instructors={instructors.docs} />
        </div> 
    )
}