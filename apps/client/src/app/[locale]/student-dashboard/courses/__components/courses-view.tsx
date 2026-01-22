"use client"
import { Input } from "@/components/atoms/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { IEnrollment } from "@/lib/types/enrollment/enrollment.interface";
import { BookOpen, Filter, Search, TrendingUp } from "lucide-react";
import { useState } from "react";
import { EnrollmentCard } from "./enrollment-card";
import { useTranslations } from "next-intl";



interface EnrollmentsProps {
    enrollments: IEnrollment[];
}

export default function Enrollments({ enrollments }: EnrollmentsProps) {
    const t = useTranslations('StudentCourses.page');

    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const filteredEnrollments = enrollments
    // .filter(enrollment => {
    //     const matchesSearch = enrollment.course?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    //     const matchesFilter = filterStatus === "all" ||
    //         (filterStatus === "active" && enrollment.subscription?.status === SubscriptionStatus.ACTIVE) ||
    //         (filterStatus === "completed" && enrollment.progressPercentage === 100) ||
    //         (filterStatus === "in-progress" && enrollment.progressPercentage > 0 && enrollment.progressPercentage < 100);

    //     return matchesSearch && matchesFilter;
    // });

    const totalProgress = enrollments.reduce((sum, enrollment) => sum + enrollment.progressPercentage, 0) / enrollments.length;
    const completedCourses = enrollments.filter(e => e.progressPercentage === 100).length;
    const totalTimeSpent = enrollments.reduce((sum, enrollment) => sum + enrollment.timeSpentMinutes, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br  ">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold  mb-2">{t('title')}</h1>
                    <p  >{t('subtitle')}</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="  p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center gap-3">
                            <div className="p-2  rounded-lg">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm ">{t('stats.enrolledCourses')}</p>
                                <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="  p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center gap-3">
                            <div className="p-2   rounded-lg">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm ">{t('stats.averageProgress')}</p>
                                <p className="text-2xl font-bold text-gray-900">{Math.round(totalProgress)}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="  p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center gap-3">
                            <div className="p-2  rounded-lg">
                                <BookOpen className="w-5 h-5 " />
                            </div>
                            <div>
                                <p className="text-sm ">{t('stats.completed')}</p>
                                <p className="text-2xl font-bold text-gray-900">{completedCourses}</p>
                            </div>
                        </div>
                    </div>

                    <div className="  p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm ">{t('stats.timeSpent')}</p>
                                <p className="text-2xl font-bold text-gray-900">{Math.floor(totalTimeSpent / 60)}h</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="  p-6 rounded-lg shadow-sm border mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2  w-4 h-4" />
                            <Input
                                placeholder={t('search.placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full sm:w-48">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder={t('search.filterPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('search.allCourses')}</SelectItem>
                                <SelectItem value="active">{t('search.activeSubscription')}</SelectItem>
                                <SelectItem value="in-progress">{t('search.inProgress')}</SelectItem>
                                <SelectItem value="completed">{t('search.completed')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEnrollments.map((enrollment) => (
                        <EnrollmentCard
                            key={enrollment._id}
                            enrollment={enrollment}

                        />
                    ))}
                </div>

                {filteredEnrollments.length === 0 && (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noCourses.title')}</h3>
                        <p className="">{t('noCourses.description')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}