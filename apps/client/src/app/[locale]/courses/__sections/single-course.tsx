"use client"

import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Separator } from "@/components/atoms/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/tabs";
import { ArrowLeft, Star, Clock, Users, BookOpen, Award, CheckCircle, Play, Download, Globe, Smartphone, Timer, FileText, Video, ClipboardList } from "lucide-react";
import { useState, useEffect } from "react";
import { ICourseOverview } from "@/lib/types/course/course.interface";
import { CourseContentType } from "@/lib/types/course/enum/CourseContentType.enum";
import BreadCrumb from "@/components/organs/Breadcrumb";
import SingleCourseHeader from "../__components/single-course-header";
import InstructorCard from "../__components/instructor-dard";
import CourseContent from "../__components/course-content";
import SingleCourseOverView from "../__components/single-course-overview";
import { IUser } from "@/lib/types/user/user.interface";

const SingleCourse = ({ course, user }: { course: ICourseOverview, user?: IUser }) => {
    
    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            {/* <BreadCrumb /> */}

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Course Header */}
                        <SingleCourseHeader course={course} />

                        {/* Instructor */}
                        <InstructorCard course={course} />

                        {/* What You'll Learn */}
                        <Card>
                            <CardHeader>
                                <CardTitle>What you'll learn</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-3">
                                    {course.learningObjectives.map((item, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Course Content */}

                        <CourseContent course={course} />
                        {/* Student Reviews */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Student Reviews</CardTitle>
                            </CardHeader>
                            {/* <CardContent className="space-y-6">
                                {course.testimonials.map((testimonial, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-start gap-3">
                                            <Avatar>
                                                <AvatarImage src={testimonial.avatar} />
                                                <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{testimonial.name}</span>
                                                    <span className="text-sm text-muted-foreground">{testimonial.role}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(testimonial.rating)].map((_, i) => (
                                                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                                                    ))}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{testimonial.text}</p>
                                            </div>
                                        </div>
                                        {index < course.testimonials.length - 1 && <Separator className="mt-4" />}
                                    </div>
                                ))}
                            </CardContent> */}
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Course Preview Card */}
                        <SingleCourseOverView course={course} user={user} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleCourse;