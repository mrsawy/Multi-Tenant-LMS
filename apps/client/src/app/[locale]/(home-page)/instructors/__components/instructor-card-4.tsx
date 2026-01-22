'use client';

import React from 'react';
import { Card, CardContent } from '@/components/atoms/card';
import { Star, Users, BookOpen, ArrowRight, ArrowRightIcon } from 'lucide-react';
import Image from 'next/image';
import { getFileFullUrl } from '@/lib/utils/getFileFullUrl';
import { IInstructor, IUser } from '@/lib/types/user/user.interface';
import { Link } from '@/i18n/navigation';
import { ButtonArrowRight } from '@/components/molecules/button-arrow-right';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/atoms/button';
import { Typography } from '@/components/atoms/typography';

const InstructorCard4: React.FC<{ instructor: IInstructor }> = ({ instructor }) => {
    const t = useTranslations('Instructors');
    const avatarUrl = instructor.profile?.avatar
        ? getFileFullUrl(instructor.profile.avatar)
        : '/images/default-avatar.png';

    const formatNumber = (num?: number) => {
        if (!num) return '0';
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    return (
        <Link href={`/instructors/${instructor._id}`}>
            <Card className='group relative overflow-hidden bg-section-card border-border/50 hover:border-brand-purple/50 transition-all duration-300 hover:shadow-2xl cursor-pointer h-full flex flex-col py-0'>
                {/* Image Overlay Header */}
                <div className='relative h-40  '>
                    <div className='absolute inset-0 flex items-center justify-center'>
                        <div className='relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-2xl ring-4 ring-white/20 group-hover:scale-110 transition-transform duration-300'>
                            <Image
                                src={avatarUrl}
                                alt={`${instructor.firstName} ${instructor.lastName}`}
                                fill
                                className='object-cover'
                            />
                        </div>
                    </div>
                </div>

                <CardContent className='p-6 flex-1 flex flex-col'>
                    {/* Name and Bio */}
                    <div className='text-center mb-4 -mt-12 relative z-10'>
                        <div className='bg-section-card rounded-lg p-4 shadow-lg border border-border/50'>
                            <Typography
                                as="h3"
                                variant="h5"
                                weight="bold"
                                align="center"
                                className='mb-1 group-hover:text-brand-purple transition-colors flex justify-center' 
                            >
                                {instructor.firstName} {instructor.lastName}
                            </Typography>
                            <Typography
                                variant="small"
                                color="muted"
                                align="center"
                                className='line-clamp-2 flex justify-center sm:text-center'
                            >
                                {instructor.profile?.shortBio || instructor.profile?.bio || t('expertInstructor')}
                            </Typography>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className='flex items-center justify-around gap-2 mb-4 pt-4 border-t border-border/50'>

                        <div className='flex flex-col items-center'>
                            <div className='flex items-center gap-1 mb-1'>
                                <Star className='w-4 h-4 text-yellow-500 fill-current' />
                                <Typography variant="span" size="sm" weight="bold">
                                    {(instructor.averageCoursesRating ?? 0).toFixed(1)}
                                </Typography>
                            </div>
                            <Typography variant="span" size="xs" color="muted">
                                {t('rating')}
                            </Typography>
                        </div>

                        <div className='flex flex-col items-center'>
                            <div className='flex items-center gap-1 mb-1'>
                                <Users className='w-4 h-4 text-blue-500' />
                                <Typography variant="span" size="sm" weight="bold">
                                    {formatNumber(instructor.totalStudents ?? 0)}
                                </Typography>
                            </div>
                            <Typography variant="span" size="xs" color="muted">
                                {t('students')}
                            </Typography>
                        </div>
                        <div className='flex flex-col items-center'>
                            <div className='flex items-center gap-1 mb-1'>
                                <BookOpen className='w-4 h-4 text-purple-500' />
                                <Typography variant="span" size="sm" weight="bold">
                                    {instructor.totalCourses ?? 0}
                                </Typography>
                            </div>
                            <Typography variant="span" size="xs" color="muted">
                                {t('courses')}
                            </Typography>
                        </div>
                    </div>

                    {/* Categories */}
                    {instructor.categories && instructor.categories.length > 0 && (
                        <div className='flex flex-wrap gap-2 mb-4 flex-1 justify-center'>
                            {instructor.categories.slice(0, 2).map((category) => (
                                <Typography
                                    key={category._id}
                                    variant="span"
                                    size="xs"
                                    weight="medium"
                                    className='inline-flex items-center px-2 py-1 rounded-md bg-brand-purple/10 text-brand-purple border border-brand-purple/20'
                                >
                                    {category.name}
                                </Typography>
                            ))}
                        </div>
                    )}

                    {/* Footer CTA */}
                    <div className='flex items-center justify-center gap-2 pt-4 border-t border-border/50 text-sm text-brand-purple group-hover:gap-3 transition-all'>

                        <Button
                            variant="default"          // your base style
                            effect="expandIcon"
                            icon={ArrowRightIcon}
                            iconPlacement="right"
                        >
                            {t('viewProfile')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};

export default InstructorCard4;
