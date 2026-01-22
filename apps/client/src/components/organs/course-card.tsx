"use client"

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Clock, Users, Star, Play, BookOpen, TrendingUp } from "lucide-react";
import Image from "next/image";
import { getFileFullUrl } from "@/lib/utils/getFileFullUrl";
import { ICourse } from '@/lib/types/course/course.interface';
import { Link } from '@/i18n/navigation';
import { ButtonArrowRight } from '@/components/molecules/button-arrow-right';
import { Typography } from '@/components/atoms/typography';
import { useTranslations } from 'next-intl';
import { Price } from '@/components/molecules/price';
import { Currency } from '@/lib/data/currency.enum';
import { BorderBeam } from '../atoms/border-beam';

const CourseCard: React.FC<{ course: ICourse }> = ({ course }) => {
    const t = useTranslations('CourseCard');
    return (
        <Card key={course._id?.toString()}
            className="bg-section-card border-border/50 hover:border-brand-purple/30 transition-all duration-300 hover:shadow-lg group relative py-0 gap-0 flex flex-col justify-between ">
            <CardHeader className="p-0">
                <Link href={"/courses/" + course._id}>
                    {/* Course Thumbnail */}
                    <div className={`h-56 sm:h-72 ${course.thumbnailKey} relative overflow-hidden`}>
                        <Image src={getFileFullUrl(course.thumbnailKey ?? "")} alt="Course Thumbnail" fill className=" rounded-t-xl object-cover object-center fixed top-0 size-full" />
                        <div className="absolute inset-0" />
                        {/* Trending Badge */}
                        <Badge className="absolute top-1 left-1 sm:top-4 sm:left-4 bg-brand-purple text-sm sm:text-sm py-0.5 px-1.5 sm:px-2">
                            <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                            <Typography variant="span" size="sm" weight="medium" className="text-sm sm:text-sm">
                                {t('trending')}
                            </Typography>
                        </Badge>

                        {/* Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-10 h-10 sm:w-16 sm:h-16 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <Play className="w-4 h-4 sm:w-6 sm:h-6 ml-0.5 sm:ml-1" />
                            </div>
                        </div>
                        {/* Category */}
                        <div className="absolute bottom-1 left-1 sm:bottom-4 sm:left-4 border-white/30 flex flex-wrap gap-0.5 sm:gap-1">
                            {course.categories && course.categories.length > 0 && (course.categories.slice(0, 2).map((category) => <Badge key={category._id || category.name}
                                variant="default"
                                className="text-sm sm:text-sm py-0.5 px-1.5 sm:px-2"

                            >
                                <Typography variant="p" size="sm" weight="medium" className='text-accent-foreground text-sm sm:text-sm'>
                                    {category.name}
                                </Typography>
                            </Badge>))}
                        </div>
                    </div>
                </Link>
            </CardHeader>

            <CardContent className="p-2 px-2.5 sm:p-2 sm:px-6">
                {/* Course Info */}
                <div className="flex items-center justify-start mb-2.5 sm:mb-3 text-start py-1">
                    <div className="flex items-center justify-center gap-1.5 sm:gap-1">
                        <Star className="w-5 h-5 sm:w-4 sm:h-4 text-yellow-500 fill-current shrink-0 mb-[3px]" />
                        <Typography variant="span" size="sm" color="muted" className="text-base sm:text-sm text-start font-semibold leading-0">
                            {course.stats?.averageRating}
                        </Typography>
                        <Typography variant="span" size="sm" color="muted" className="text-base sm:text-sm text-start">
                            ({course.stats?.totalReviews})
                        </Typography>
                    </div>
                </div>
                <Link href={"/courses/" + course._id} className="text-start">
                    <Typography variant="h4" weight="bold" className="mb-1 sm:mb-2 line-clamp-2 text-lg sm:text-lg text-start leading-tight sm:leading-normal">
                        {course.name}
                    </Typography>
                </Link>

                <Typography variant="p" size="sm" className="mb-1.5 sm:mb-4 line-clamp-2 text-sm sm:text-sm text-start leading-tight sm:leading-normal">
                    {course.description}
                </Typography>

                <Typography variant="p" size="sm" color="purple" weight="medium" className="mb-1.5 sm:mb-4 text-sm sm:text-sm text-start">
                    {t('byInstructor')} {course.instructor?.firstName} {course.instructor?.lastName}
                </Typography>

                {/* Course Stats */}
                <div className="grid grid-cols-2 gap-1 sm:gap-4 mb-1.5 sm:mb-4">
                    <div className="flex items-center gap-0.5 sm:gap-2 text-start">
                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
                        <Typography variant="span" size="sm" color="muted" className="text-sm sm:text-sm text-start leading-tight">
                            {course.stats?.totalEnrollments}
                        </Typography>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-2 text-start">
                        <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
                        <Typography variant="span" size="sm" color="muted" className="text-sm sm:text-sm text-start leading-tight">
                            {course.modulesIds?.length} {t('lessons')}
                        </Typography>
                    </div>
                </div>

                {/* Certificate Badge */}
                {course.settings?.certificateEnabled && (
                    <Badge variant="secondary" className="text-brand-purple border-brand-purple/20 mb-1.5 sm:mb-4 text-sm sm:text-sm py-0.5 px-1.5 sm:px-2 w-fit">
                        <Typography variant="span" size="sm" weight="medium" className="text-sm sm:text-sm text-start">
                            {t('certificateIncluded')}
                        </Typography>
                    </Badge>
                )}
            </CardContent>



            <CardFooter className="p-2 px-2.5 sm:p-6 pt-0 flex items-center justify-between gap-1.5 sm:gap-4">
                <div className="text-start">
                    <Price
                        isPaid={course.isPaid}
                        pricing={course.pricing}
                        preferredCurrency={Currency.EGP}
                    />
                </div>
                <Link href={"/courses/" + course._id} className="text-start">
                    <ButtonArrowRight>
                        {t('enrollNow')}
                    </ButtonArrowRight>
                </Link>
            </CardFooter>
            <BorderBeam
                duration={6}
                size={400}
                className="from-transparent via-accent to-transparent"
            />
            <BorderBeam
                duration={6}
                delay={3}
                size={400}
                borderWidth={2}
                className="from-transparent via-primary to-transparent"
            />
        </Card>
    );
};

export default CourseCard;