import React from 'react';
import { IInstructor } from '@/lib/types/user/user.interface';
import InstructorProfileHeader from '../__components/instructor-profile-header';
import InstructorBio from '../__components/instructor-bio';
import InstructorStats from '../__components/instructor-stats';
import InstructorCourses from '../__components/instructor-courses';

const InstructorDetailsSection: React.FC<{ instructor: IInstructor }> = ({ instructor }) => {
    return (
        <div className='min-h-screen bg-background'>
            <InstructorProfileHeader instructor={instructor} />

            <div className='container mx-auto px-4 py-8 md:py-12'>
                <div className='grid lg:grid-cols-3 gap-6 lg:gap-8'>
                    {/* Main Content Column */}
                    <div className='lg:col-span-2 space-y-6 lg:space-y-8'>
                        <InstructorBio instructor={instructor} />
                        <InstructorCourses instructor={instructor} />
                    </div>

                    {/* Sidebar Column */}
                    <div className='space-y-6 lg:space-y-8'>
                        <InstructorStats instructor={instructor} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorDetailsSection;
