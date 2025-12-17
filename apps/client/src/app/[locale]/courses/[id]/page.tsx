import React from 'react';
import SingleCourse from '../__sections/single-course';
import { createAuthorizedNatsRequest, createNatsRequest } from '@/lib/utils/createNatsRequest';
import { getAuthUser } from '@/lib/actions/user/user.action';

const SingleCoursePage: React.FC<{ params: Promise<{ id: string }> }> = async ({ params }) => {
    const courseId = (await params).id;
    const course = await createNatsRequest("courses.getCourseWithModule", { courseId, includeContents: true, contentSelect: "title type" });
    const user = await getAuthUser();
    console.log({ courseId, course })
    console.log('📚 SINGLE COURSE PAGE IS RENDERING');

    return (
        <SingleCourse course={course} user={user} />
    );
};

export default SingleCoursePage;