import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/atoms/badge';
import { Star, Users, BookOpen, Linkedin, Twitter } from 'lucide-react';
import { getFileFullUrl } from '@/lib/utils/getFileFullUrl';
import { IInstructor } from '@/lib/types/user/user.interface';
import { Typography } from '@/components/atoms/typography';
import { useTranslations } from 'next-intl';

const InstructorProfileHeader: React.FC<{ instructor: IInstructor }> = ({ instructor }) => {
    const t = useTranslations('Instructors');
    const avatarUrl = instructor.profile?.avatar
        ? getFileFullUrl(instructor.profile.avatar)
        : '/images/default-avatar.png';

    const formatNumber = (num?: number) => {
        if (!num) return '0';
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const averageRating = instructor.averageCoursesRating || 0;
    const totalRatings = instructor.totalCoursesReviews || 0;
    const totalStudents = instructor.totalStudents || 0;
    const totalCourses = instructor.totalCourses || 0;

    return (
        <div className='bg-gradient-to-br from-background via-background to-muted/20 border-b'>
            <div className='container mx-auto px-4 py-8 md:py-12'>
                <div className='flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start'>
                    {/* Avatar */}
                    <div className='relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-background shadow-xl ring-4 ring-primary/10 flex-shrink-0  '>
                        <Image
                            src={avatarUrl}
                            alt={`${instructor.firstName} ${instructor.lastName}`}
                            fill
                            className='object-cover'
                            priority
                        />
                    </div>

                    {/* Content */}
                    <div className='flex-1 text-center md:text-left w-full'>
                        <Typography
                            as="h1"
                            variant="h1"
                            weight="bold"
                            align="center"
                            className='md:text-left mb-2 flex justify-center md:justify-start'
                        >
                            {instructor.firstName} {instructor.lastName}
                        </Typography>
                        <Typography
                            variant="lead"
                            color="muted"
                            align="center"
                            className='md:text-left mb-6 flex justify-center md:justify-start'
                        >
                            {instructor.profile?.shortBio || t('expertInstructor')}
                        </Typography>

                        {/* Stats Row */}
                        <div className='flex items-center justify-center md:justify-start gap-1 sm:gap-4 md:gap-6 mb-6 flex-nowrap sm:flex-wrap'>
                            {averageRating > 0 && (
                                <div className='flex items-center gap-2 bg-card px-2 sm:px-4 py-2 rounded-lg border shadow-sm'>
                                    <Star className='w-5 h-5 text-yellow-500 fill-yellow-500' />
                                    <Typography variant="span" weight="semibold">
                                        {averageRating.toFixed(1)}
                                    </Typography>
                                    {totalRatings > 0 && (
                                        <Typography variant="span" size="sm" color="muted">
                                            ({formatNumber(totalRatings)})
                                        </Typography>
                                    )}
                                </div>
                            )}
                            {totalStudents > 0 && (
                                <div className='flex items-center gap-2 bg-card px-2 sm:px-4 py-2 rounded-lg border shadow-sm'>
                                    <Users className='w-5 h-5 text-blue-500' />
                                    <Typography variant="span" weight="medium">
                                        {formatNumber(totalStudents)}
                                    </Typography>
                                    <Typography variant="span" size="sm" color="muted">
                                        {t('students')}
                                    </Typography>
                                </div>
                            )}
                            {totalCourses > 0 && (
                                <div className='flex items-center gap-2 bg-card px-2 sm:px-4 py-2 rounded-lg border shadow-sm'>
                                    <BookOpen className='w-5 h-5 text-green-500' />
                                    <Typography variant="span" weight="medium">
                                        {formatNumber(totalCourses)}
                                    </Typography>
                                    <Typography variant="span" size="sm" color="muted">
                                        {t('courses')}
                                    </Typography>
                                </div>
                            )}
                        </div>

                        {/* Categories */}
                        {instructor.categories && instructor.categories.length > 0 && (
                            <div className='flex flex-wrap gap-2 justify-center md:justify-start mb-6'>
                                {instructor.categories.map((category) => (
                                    <Badge
                                        key={category._id}
                                        variant='outline'
                                        className='text-sm px-3 py-1 hover:bg-primary/10 transition-colors'
                                    >
                                        {category.name}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Social Links */}
                        {(instructor.profile?.socialLinks?.linkedin || instructor.profile?.socialLinks?.twitter) && (
                            <div className='flex gap-4 justify-center md:justify-start'>
                                {instructor.profile.socialLinks.linkedin && (
                                    <a
                                        href={instructor.profile.socialLinks.linkedin}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted'
                                        aria-label={t('linkedinProfile')}
                                    >
                                        <Linkedin className='w-5 h-5' />
                                    </a>
                                )}
                                {instructor.profile.socialLinks.twitter && (
                                    <a
                                        href={instructor.profile.socialLinks.twitter}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted'
                                        aria-label={t('twitterProfile')}
                                    >
                                        <Twitter className='w-5 h-5' />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorProfileHeader;