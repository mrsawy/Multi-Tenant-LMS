"use client"
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Progress } from "@/components/atoms/progress";
import { ICourseOverview } from "@/lib/types/course/course.interface";
import { IEnrollment } from "@/lib/types/enrollment/enrollment.interface";
import { ArrowLeft, Award, BookOpen, Clock, Star, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { CourseModules } from "./course-modules";
import { useRouter } from "next/navigation";



interface CourseViewProps {
    onViewContent?: (contentId: string, courseId: string) => void;
    enrollment: IEnrollment | null;
    course: ICourseOverview
}

export default function CourseView({ course, enrollment, onViewContent }: CourseViewProps) {

    const router = useRouter()
    console.log({ course })
    const handleStartContent = (contentId: string) => {
        onViewContent?.(contentId, course._id);
    };

    if (!course || !enrollment) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Course not found</h2>
                    <Button onClick={
                        () => { router.back() }
                    }>Go Back</Button>
                </div>
            </div>
        );
    }

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br  ">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={
                            () => { router.back() }
                        }
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to My Courses
                    </Button>

                    <div className=" rounded-lg shadow-sm border p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <h1 className="text-3xl font-bold mb-3">
                                    {course.name}
                                </h1>
                                <p className=" mb-4">
                                    {course.description}
                                </p>

                                <div className="flex flex-wrap gap-4 mb-4">
                                    <div className="flex items-center gap-2 text-sm ">
                                        <Clock className="w-4 h-4" />
                                        <span>{course.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm ">
                                        <Users className="w-4 h-4" />
                                        <span>{course.stats?.totalEnrollments.toLocaleString()} students</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm ">
                                        <Star className="w-4 h-4" />
                                        <span>{course.stats?.averageRating.toFixed(1)} rating</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm ">
                                        <BookOpen className="w-4 h-4" />
                                        <span>{course.language}</span>
                                    </div>
                                </div>

                                {course.learningObjectives.length > 0 && (
                                    <div className=" p-4 rounded-lg">
                                        <h3 className="font-semibold mb-2">What you'll learn:</h3>
                                        <ul className="space-y-1">
                                            {course.learningObjectives.map((objective, index) => (
                                                <li key={index} className="flex items-start gap-2 text-sm">
                                                    <span className="text-blue-500 mt-1">✓</span>
                                                    <span>{objective}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className=" p-4 rounded-lg">
                                    <h3 className="font-semibold mb-3">Your Progress</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Overall Progress</span>
                                                <span>{enrollment.progressPercentage}%</span>
                                            </div>
                                            <Progress value={enrollment.progressPercentage} className="h-2" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="">Time Spent</p>
                                                <p className="font-semibold">{formatDuration(enrollment.timeSpentMinutes)}</p>
                                            </div>
                                            <div>
                                                <p className="">Last Accessed</p>
                                                <p className="font-semibold">
                                                    {new Date(enrollment.lastAccessedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {enrollment.certificate.issued && (
                                            <Badge className="w-full justify-center bg-green-500">
                                                <Award className="w-4 h-4 mr-2" />
                                                Certificate Earned
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {enrollment.subscription && (
                                    <div className=" p-4 rounded-lg">
                                        <h3 className="font-semibold mb-2">Subscription</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Status</span>
                                                <Badge className={
                                                    enrollment.subscription.status === 'ACTIVE'
                                                        ? 'bg-green-500'
                                                        : '0'
                                                }>
                                                    {enrollment.subscription.status}
                                                </Badge>
                                            </div>
                                            {enrollment.subscription.next_billing && (
                                                <div className="flex justify-between">
                                                    <span>Next Billing</span>
                                                    <span>{new Date(enrollment.subscription.next_billing).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Content */}
                <div className=" rounded-lg shadow-sm border p-6">
                    <h2 className="text-2xl font-bold mb-6">Course Content</h2>
                    <CourseModules
                        modules={course.modules}
                        completedModules={enrollment.progress.completedModules}
                        completedContents={enrollment.progress.completedContents ?? []}
                    />
                </div>
            </div>
        </div>
    );
}