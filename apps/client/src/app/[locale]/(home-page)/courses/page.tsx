import React from 'react';
import CoursesHeaderSection from './__sections/courses-header';
import { findCourses } from '@/lib/actions/courses/getCourses.action';
import { ICourseFilters } from '@/lib/types/course/ICourseFilters';

const CoursesPage: React.FC<{ searchParams: Promise<ICourseFilters> }> = async ({ searchParams }) => {
    const courses = await findCourses((await searchParams))
    return (<CoursesHeaderSection courses={courses.docs} />);
};

export default CoursesPage;