import { Avatar, AvatarFallback } from '@/components/atoms/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { ICourseWithModules } from '@/lib/types/course/course.interface';
import { AvatarImage } from '@radix-ui/react-avatar';
import { BookOpen, Star, Users } from 'lucide-react';
import React from 'react';
import { useTranslations } from 'next-intl';

const InstructorCard: React.FC<{ course: ICourseWithModules }> = ({ course }) => {
    const t = useTranslations('Instructors');
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('instructor')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={course?.instructor?.profile?.avatar} />
                        <AvatarFallback>{course.instructor?.firstName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{course.instructor?.firstName}</h3>
                        <p className="text-muted-foreground">{course.instructor?.username}</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-primary text-primary" />
                                {/* <span>{course.instructor.rating} rating</span> */}
                            </div>
                            <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {/* <span>{course.instructor.students.toLocaleString()} students</span> */}
                            </div>
                            <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                {/* <span>{course.instructor.courses} courses</span> */}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default InstructorCard;