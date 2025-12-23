import { createAuthorizedNatsRequest } from '@/lib/utils/createNatsRequest';
import React from 'react';
import Enrollments from './__components/courses-view';
import { Paginated, PaginationOptions } from '@/lib/types/Paginated';
import { IEnrollment } from '@/lib/types/enrollment/enrollment.interface';


const CoursesPage: React.FC<{ searchParams: Promise<PaginationOptions> }> = async ({ searchParams }) => {

    const options = await searchParams

    const enrollments = await createAuthorizedNatsRequest("enrollment.getUserEnrollments", { options }) as Paginated<IEnrollment>

    return (
        <div>
            <Enrollments enrollments={enrollments.docs} />
        </div>
    );
};

export default CoursesPage;