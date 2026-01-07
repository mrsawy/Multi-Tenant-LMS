import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Clock, Users, Star, Play, BookOpen, TrendingUp } from "lucide-react";
import Image from "next/image";
import { getFileFullUrl } from "@/lib/utils/getFileFullUrl";
import { ICourse } from '@/lib/types/course/course.interface';
import { Button } from '@/components/atoms/button';
import { Link } from '@/i18n/navigation';
import { ButtonArrowRight } from '@/components/molecules/button-arrow-right';

const CourseCard: React.FC<{ course: ICourse }> = ({ course }) => {
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
                            Trending
                        </Badge>

                        {/* Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-16 h-16   backdrop-blur-sm rounded-full flex items-center justify-center">
                                <Play className="w-6 h-6  ml-1" />
                            </div>
                        </div>
                        {/* Category */}
                        <Badge className="absolute bottom-4 left-4   backdrop-blur-sm  border-white/30">
                            {/* {course.category} */}
                            Course Category
                        </Badge>
                    </div>
                </Link>
            </CardHeader>

            <CardContent className="p-2 px-6">
                {/* Course Info */}
                <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" >
                        Course Level
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{course.stats?.averageRating}</span>
                        <span>({course.stats?.totalRatings})</span>
                    </div>
                </div>
                <Link href={"/courses/" + course._id}>
                    <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">
                        {course.name}
                    </h3>
                </Link>

                <p className="text-sm  mb-4 line-clamp-2">
                    {course.description}
                </p>

                <p className="text-sm text-brand-purple font-medium mb-4">
                    by Instructor
                    {course.instructor?.firstName} {course.instructor?.lastName}
                </p>

                {/* Course Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                            Course Duration
                            {/* {course.duration} */}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                            {course.stats?.totalEnrollments}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{course.modulesIds?.length} lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        <span>
                            {course.modulesIds?.length}
                            projects</span>
                    </div>
                </div>

                {/* Certificate Badge */}
                {course.settings?.certificateEnabled && (
                    <Badge variant="secondary" className="  text-brand-purple border-brand-purple/20 mb-4">
                        Certificate Included
                    </Badge>
                )}
            </CardContent>

            <CardFooter className="p-6 pt-0 flex items-center justify-between">
                <div className="text-left">
                    <span className="text-2xl font-bold text-foreground">{course.isPaid ? "$" + course.pricing.MONTHLY?.originalPrice : <p className="p-1 px-2 rounded-2xl bg-green-600 text-white text-sm">FREE</p>}</span>
                </div>
                <Link href={"/courses/" + course._id}>
                    <ButtonArrowRight>
                        Enroll Now
                    </ButtonArrowRight>
                </Link>
            </CardFooter>
        </Card>
    );
};

export default CourseCard;