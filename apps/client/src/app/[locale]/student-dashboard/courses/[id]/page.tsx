import React from 'react';
import CourseView from '../__components/single-course-view';
import { createAuthorizedNatsRequest } from '@/lib/utils/createNatsRequest';
import { ICourseOverview } from '@/lib/types/course/course.interface';
import { IEnrollment } from '@/lib/types/enrollment/enrollment.interface';

const SingleCourseEnrolledPage: React.FC<{ params: Promise<{ id: string, locale: string }> }> = async ({ params }) => {
    const enrollmentId = (await params).id;

    const result = await createAuthorizedNatsRequest("enrollment.getDetailedEnrolledCourse", { enrollmentId }) as { data: { course: ICourseOverview, enrollment: IEnrollment } }


    const { course, enrollment } = result.data
    return (
        <div>
            <CourseView course={course} enrollment={enrollment} />
        </div>
    );
};

export default SingleCourseEnrolledPage;