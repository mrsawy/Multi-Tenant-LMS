"use client"

import { IEnrollment } from "@/lib/types/enrollment/enrollment.interface";
import { SubscriptionStatus } from "@/lib/types/subscription/subscription.enum";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Progress } from "@/components/atoms/progress";
import { Button } from "@/components/atoms/button";
import { Calendar } from "@/components/atoms/calendar";
import { Award, BookOpen, Clock } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { UserRatingDisplay } from "@/components/organs/user-rating-display";
import { ReviewType } from "@/lib/types/review/review.types";
import { useTranslations } from "next-intl";


interface EnrollmentCardProps {
    enrollment: IEnrollment;

}

export function EnrollmentCard({ enrollment, }: EnrollmentCardProps) {
    const t = useTranslations('StudentCourses.enrollmentCard');
    const tStatus = useTranslations('StudentCourses.subscriptionStatus');
    const { course, progressPercentage, timeSpentMinutes, subscription, certificate } = enrollment;

    if (!course) return null;

    const getStatusColor = (status?: SubscriptionStatus) => {
        switch (status) {
            case SubscriptionStatus.ACTIVE:
                return "bg-green-500";
            case SubscriptionStatus.EXPIRED:
                return "bg-red-500";
            case SubscriptionStatus.CANCELLED:
            case SubscriptionStatus.SUSPENDED:
                return "bg-gray-500";
            default:
                return "bg-blue-500";
        }
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };


    const router = useRouter()

    return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold line-clamp-2">
                        {course.name}
                    </CardTitle>
                    <div className="flex gap-2">
                        {subscription && (
                            <Badge className={getStatusColor(subscription.status)}>
                                {tStatus(subscription.status)}
                            </Badge>
                        )}
                        {certificate.issued && (
                            <Badge variant="secondary">
                                <Award className="w-3 h-3 mr-1" />
                                {t('certified')}
                            </Badge>
                        )}
                    </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.shortDescription || course.description}
                </p>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>{t('progress')}</span>
                        <span>{progressPercentage}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDuration(timeSpentMinutes)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span>{course.duration || t('selfPaced')}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    {course.stats && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>⭐ {course.stats.averageRating.toFixed(1)}</span>
                            <span>{course.stats.totalEnrollments.toLocaleString()} {t('students')}</span>
                        </div>
                    )}
                    <UserRatingDisplay
                        reviewType={ReviewType.COURSE}
                        entityId={course._id}
                        showLabel={false}
                    />
                </div>

                <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {/* <Calendar className="w-4 h-4" /> */}
                        <span>{t('enrolled')} {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                    </div>
                    <Button
                        onClick={() => router.push("/student-dashboard/courses/" + enrollment._id)}

                        size="sm"
                    >
                        {t('continueLearning')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}