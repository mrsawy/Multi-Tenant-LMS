import React from 'react';
import CoursesHeaderSection from './_sections/courses-header';
import { findCourses } from '@/lib/actions/courses/getCourses.action';

const CoursesPage: React.FC<{ searchParams: { page?: number, limit?: number } }> = async ({ searchParams }) => {

    const { page, limit } =  searchParams

    console.log({ page, limit })

    const courses = await findCourses(page, limit)

    return (
        <div>
            <CoursesHeaderSection courses={courses.docs} />
        </div>
    );
};

export default CoursesPage;