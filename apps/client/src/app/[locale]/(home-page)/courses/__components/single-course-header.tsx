
import { Badge } from '@/components/atoms/badge';
import { ICourse, ICourseWithModules } from '@/lib/types/course/course.interface';
import { BookOpen, Clock, Star, Users } from 'lucide-react';
import React from 'react';

const SingleCourseHeader: React.FC<{ course: ICourseWithModules }> = ({ course }) => {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {/* <Badge variant="secondary">{course.level}</Badge> */}
                <Badge variant="outline">Bestseller</Badge>
                <Badge variant="outline">Updated {course.updatedAt}</Badge>
                {!course.isPaid && <Badge variant="outline" className="bg-green-100 text-green-800">Free</Badge>}
            </div>

            <h1 className="text-4xl font-bold tracking-tight">{course.name}</h1>
            <p className="text-xl text-muted-foreground">{course.shortDescription}</p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-medium text-foreground">{course.stats?.averageRating}</span>
                    <span>({course.stats?.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.stats?.totalEnrollments.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {/* <span>{course.duration}</span> */}
                </div>
                <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.modules.length} modules</span>
                </div>
            </div>
        </div>
    );
};

export default SingleCourseHeader;