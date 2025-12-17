import React from 'react';
import CoursesHeaderSection from './__sections/courses-header';
import { findCourses } from '@/lib/actions/courses/getCourses.action';
import { ICourseFilters } from '@/lib/types/course/ICourseFilters';

const CoursesPage: React.FC<{ searchParams: Promise<ICourseFilters> }> = async ({ searchParams }) => {

    const courses = await findCourses((await searchParams))
    console.log(` 
    
    Courses page is peing rendered
    
    
    
    `)
    return (
        <div>
            <CoursesHeaderSection courses={courses.docs} />
        </div>
    );
};

export default CoursesPage;