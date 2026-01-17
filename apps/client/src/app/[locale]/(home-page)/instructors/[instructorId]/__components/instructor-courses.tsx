'use client';

import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { BookOpen, Loader2 } from 'lucide-react';
import { IInstructor } from '@/lib/types/user/user.interface';
import { useCoursesByInstructor } from '@/lib/hooks/course/useCourses';
import CourseCard from '@/app/[locale]/(home-page)/courses/__components/course-card';
import { ICourse } from '@/lib/types/course/course.interface';
import { Typography } from '@/components/atoms/typography';
import { useTranslations } from 'next-intl';

const InstructorCourses: React.FC<{ instructor: IInstructor }> = ({ instructor }) => {
    const t = useTranslations('Instructors');
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
    } = useCoursesByInstructor(instructor._id, 12);

    // Flatten all pages into a single array
    const courses: ICourse[] = data?.pages.flatMap((page) => page.docs || []) || [];
    console.dir({ w: "rr,", courses, data }, { depth: null })

    useEffect(() => {
        console.dir({ data, courses }, { depth: null })
    }, [data])
    // Intersection Observer for infinite scroll
    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <Card className='shadow-sm hover:shadow-md transition-shadow'>
            <CardHeader>
                <CardTitle className='text-2xl font-bold text-foreground flex items-center gap-2'>
                    <BookOpen className='w-6 h-6 text-primary' />
                    <Typography variant="h3" weight="bold">
                        {t('courses')}
                    </Typography>
                    {instructor.totalCourses !== undefined && instructor.totalCourses > 0 && (
                        <Typography variant="span" size="base" weight="normal" color="muted" className='ml-2'>
                            ({courses.length ?? 0})
                        </Typography>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isError ? (
                    <div className='flex flex-col items-center justify-center py-12 text-center'>
                        <Typography variant="p" color="destructive" size="lg" weight="medium" className='mb-2'>
                            {t('errorLoadingCourses')}
                        </Typography>
                        <Typography variant="p" color="muted" size="sm" className='opacity-70'>
                            {error instanceof Error ? error.message : t('tryAgainLater')}
                        </Typography>
                    </div>
                ) : isLoading ? (
                    <div className='flex flex-col items-center justify-center py-12 text-center'>
                        <Loader2 className='w-8 h-8 text-primary animate-spin mb-4' />
                        <Typography variant="p" color="muted" size="sm">
                            {t('loadingCourses')}
                        </Typography>
                    </div>
                ) : courses.length > 0 ? (
                    <>
                        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {courses.map((course) => (
                                <CourseCard key={course._id} course={course} />
                            ))}
                        </div>
                        {/* Infinite scroll trigger */}
                        <div ref={observerTarget} className='h-4 w-full' />
                        {isFetchingNextPage && (
                            <div className='flex justify-center items-center py-8'>
                                <Loader2 className='w-6 h-6 text-primary animate-spin' />
                                <Typography variant="span" color="muted" size="sm" className='ml-2'>
                                    {t('loadingMoreCourses')}
                                </Typography>
                            </div>
                        )}
                        {!hasNextPage && courses.length > 0 && (
                            <Typography variant="p" color="muted" size="sm" align="center" className='py-4'>
                                {t('noMoreCourses')}
                            </Typography>
                        )}
                    </>
                ) : (
                    <div className='flex flex-col items-center justify-center py-12 text-center'>
                        <BookOpen className='w-12 h-12 text-muted-foreground/50 mb-4' />
                        <Typography variant="p" color="muted" size="lg" weight="medium" className='mb-2'>
                            {t('noCoursesAvailable')}
                        </Typography>
                        <Typography variant="p" color="muted" size="sm" className='opacity-70'>
                            {t('noCoursesPublished')}
                        </Typography>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default InstructorCourses;
