"use client"
import { useState, useMemo } from "react";
import { Search, Filter, Star, Clock, Users, BookOpen, ChevronDown } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Badge } from "@/components/atoms/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/atoms/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { Slider } from "@/components/atoms/slider";
import { Checkbox } from "@/components/atoms/checkbox";
import { Separator } from "@/components/atoms/separator";
import { Label } from "@/components/atoms/label"; import React from 'react';
import { ICourse } from "@/lib/types/course/course.interface";

import { cn } from "@/lib/utils";
import FiltersBar from "./filters-bar";
import { ICourseFilters } from "@/lib/types/course/ICourseFilters";
import { useRouter } from "next/navigation";
import { Currency } from "@/lib/data/currency.enum";
import CourseCard from "../../../../../components/organs/course-card";

const CoursesHeaderSection: React.FC<{ courses: ICourse[] }> = ({ courses }) => {
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<ICourseFilters>({ priceCurrency: Currency.EGP, page: 1, limit: 10 });

    console.dir({ courses }, { depth: null })
    const route = useRouter()


    return (
        <div className="">
            <div className="bg-gradient-dark border-b border-lms-dark-accent">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-4xl font-bold text-lms-text-primary mb-2">Explore Courses</h1>
                    <p className="text-lms-text-secondary text-lg">Discover your next learning adventure</p>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-lms-dark-secondary border-b border-lms-dark-accent">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-center lg:items-center ">
                        <div className="relative flex-1 max-w-2xl w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lms-text-muted h-5 w-5" />
                            <Input
                                placeholder="Search courses, instructors, or topics..."
                                // value={searchTerm}
                                // onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-lms-dark-accent border-lms-dark-accent text-lms-text-primary placeholder:text-lms-text-muted"
                            />
                        </div>

                        <div className="flex flex-wrap gap-3 items-center">
                            {/* <Select >
                                <SelectTrigger className="w-[180px] bg-lms-dark-accent border-lms-dark-accent text-lms-text-primary">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-lms-dark-accent border-lms-dark-accent">
                                    <SelectItem value="popularity">Most Popular</SelectItem>
                                    <SelectItem value="rating">Highest Rated</SelectItem>
                                    <SelectItem value="newest">Newest</SelectItem>
                                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                                </SelectContent>
                            </Select> */}

                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                                <ChevronDown className={`h-4 w-4 ml-2 transition-transform`} />
                            </Button>
                        </div>
                    </div>

                    {/* Expanded Filters */}
                    <div className={cn(
                        "mt-6   bg-lms-dark-accent rounded-lg transition-all duration-1000 overflow-hidden flex justify-center",
                        showFilters ? "max-h-[620px] " : "max-h-0"
                    )}
                    >
                        <FiltersBar

                            onSubmit={() => {
                                const params = new URLSearchParams(
                                    Object.entries(filters)
                                        .filter(([_, value]) => value !== undefined && value !== "")
                                        .reduce((acc, [key, value]) => {
                                            acc[key] = String(value);
                                            return acc;
                                        }, {} as Record<string, string>)
                                );

                                route.push(`/courses?${params.toString()}`);
                            }}
                            filters={filters} setFilters={setFilters} />
                    </div>



                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto pt-20">
                        {courses.map(course => <CourseCard key={course._id} course={course} />)}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CoursesHeaderSection;