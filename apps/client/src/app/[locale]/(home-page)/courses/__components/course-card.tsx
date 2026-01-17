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

const CourseCard: React.FC<{ course: ICourse }> = ({ course }) => {
    const t = useTranslations('CourseCard');
    console.dir({ course }, { depth: null })
    return (
        <Card key={course._id?.toString()} className="bg-section-card border-border/50 hover:border-brand-purple/30 transition-all duration-300 hover:shadow-lg group overflow-hidden py-0 gap-0 flex  justify-between">
            <CardHeader className="p-0">
                <Link href={"/courses/" + course._id}>
                    {/* Course Thumbnail */}
                    <div className={`h-72 ${course.thumbnailKey} relative overflow-hidden`}>
                        <Image src={getFileFullUrl(course.thumbnailKey ?? "")} alt="Course Thumbnail" fill className="object-cover object-center fixed top-0 size-full" />
                        <div className="absolute inset-0 " />
                        {/* Trending Badge */}
                        <Badge className="absolute top-4 left-4 bg-brand-purple ">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            <Typography variant="span" size="sm" weight="medium">
                                {t('trending')}
                            </Typography>
                        </Badge>

                        {/* Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-16 h-16   backdrop-blur-sm rounded-full flex items-center justify-center">
                                <Play className="w-6 h-6  ml-1" />
                            </div>
                        </div>
                        {/* Category */}
                        {course.categories && course.categories.length > 0 && (course.categories.slice(0, 2).map((category) => <Badge key={category._id || category.name}
                            className="absolute bottom-4 left-4   backdrop-blur-sm  border-white/30"
                            variant="default"
                        >
                            <Typography variant="span" size="sm" weight="medium">
                                {category.name}
                            </Typography>
                        </Badge>))}
                    </div>
                </Link>
            </CardHeader>

            <CardContent className="p-2 px-6">
                {/* Course Info */}
                <div className="flex items-center justify-between mb-3">
                    {/* <Badge variant="outline" >
                        <Typography variant="span" size="sm" weight="medium">
                            {t('courseLevel')}
                        </Typography>
                    </Badge> */}
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <Typography variant="span" size="sm" color="muted">
                            {course.stats?.averageRating}
                        </Typography>
                        <Typography variant="span" size="sm" color="muted">
                            ({course.stats?.totalReviews})
                        </Typography>
                    </div>
                </div>
                <Link href={"/courses/" + course._id}>
                    <Typography variant="h4" weight="bold" className="mb-2 line-clamp-2">
                        {course.name}
                    </Typography>
                </Link>

                <Typography variant="p" size="sm" className="mb-4 line-clamp-2">
                    {course.description}
                </Typography>

                <Typography variant="p" size="sm" color="purple" weight="medium" className="mb-4">
                    {t('byInstructor')} {course.instructor?.firstName} {course.instructor?.lastName}
                </Typography>

                {/* Course Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-muted-foreground" />
                        <Typography variant="span" size="sm" color="muted">
                            {course.stats?.totalReviews} {t('totalReviews')}
                        </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <Typography variant="span" size="sm" color="muted">
                            {course.stats?.totalEnrollments} {t('enrolledStudentsCount')}
                        </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <Typography variant="span" size="sm" color="muted">
                            {course.modulesIds?.length} {t('lessons')}
                        </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-muted-foreground" />
                        <Typography variant="span" size="sm" color="muted">
                            {course.stats?.averageRating.toFixed(1)} {t('rating')}
                        </Typography>
                    </div>
                </div>

                {/* Certificate Badge */}
                {course.settings?.certificateEnabled && (
                    <Badge variant="secondary" className="  text-brand-purple border-brand-purple/20 mb-4">
                        <Typography variant="span" size="sm" weight="medium">
                            {t('certificateIncluded')}
                        </Typography>
                    </Badge>
                )}
            </CardContent>

            <CardFooter className="p-6 pt-0 flex items-center justify-between">
                <div className="text-left">
                    {course.isPaid ? (
                        <Typography variant="span" size="2xl" weight="bold">
                            ${course.pricing.MONTHLY?.originalPrice}
                        </Typography>
                    ) : (
                        <Typography variant="span" size="sm" weight="medium" className="p-1 px-2 rounded-2xl bg-green-600 text-white">
                            {t('free')}
                        </Typography>
                    )}
                </div>
                <Link href={"/courses/" + course._id}>
                    <ButtonArrowRight>
                        {t('enrollNow')}
                    </ButtonArrowRight>
                </Link>
            </CardFooter>
        </Card>
    );
};

export default CourseCard;