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
import CourseCard from "../../__components/course-card";
import { cn } from "@/lib/utils";

const CoursesHeaderSection: React.FC<{ courses: ICourse[] }> = ({ courses }) => {
    const [showFilters, setShowFilters] = useState(false);





    return (
        <div className="pt-36">
            <div className="bg-gradient-dark border-b border-lms-dark-accent">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-4xl font-bold text-lms-text-primary mb-2">Explore Courses</h1>
                    <p className="text-lms-text-secondary text-lg">Discover your next learning adventure</p>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-lms-dark-secondary border-b border-lms-dark-accent">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                        <div className="relative flex-1 max-w-2xl">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lms-text-muted h-5 w-5" />
                            <Input
                                placeholder="Search courses, instructors, or topics..."
                                // value={searchTerm}
                                // onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-lms-dark-accent border-lms-dark-accent text-lms-text-primary placeholder:text-lms-text-muted"
                            />
                        </div>

                        <div className="flex flex-wrap gap-3 items-center">
                            <Select >
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
                            </Select>

                            <Button
                                variant="outline"
                                className="border-lms-dark-accent text-lms-text-primary hover:bg-lms-dark-accent"
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
                        "mt-6   bg-lms-dark-accent rounded-lg transition-all duration-1000 overflow-hidden",
                        showFilters ? "max-h-[600px] p-6" : "max-h-0"
                    )}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Category Filter */}
                            <div>
                                <Label className="text-lms-text-primary font-medium mb-3 block">Category</Label>
                                <Select >
                                    <SelectTrigger className="bg-lms-dark border-lms-dark text-lms-text-primary">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-lms-dark border-lms-dark">
                                        {/* {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))} */}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Level Filter */}
                            <div>
                                <Label className="text-lms-text-primary font-medium mb-3 block">Level</Label>
                                <Select >
                                    <SelectTrigger className="bg-lms-dark border-lms-dark text-lms-text-primary">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-lms-dark border-lms-dark">
                                        {/* {levels.map((level) => (
                                                <SelectItem key={level} value={level}>
                                                    {level}
                                                </SelectItem>
                                            ))} */}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Price Range */}
                            <div>
                                <Label className="text-lms-text-primary font-medium mb-3 block">
                                    Price Range:
                                </Label>
                                <Slider
                                    // value={priceRange}
                                    // onValueChange={setPriceRange}
                                    max={200}
                                    step={10}
                                    className="mt-2"
                                />
                            </div>

                            {/* Rating Filter */}
                            <div>
                                <Label className="text-lms-text-primary font-medium mb-3 block">
                                    Minimum Rating:  +
                                </Label>
                                <Slider
                                    // value={[minRating]}
                                    // onValueChange={(value) => setMinRating(value[0])}
                                    max={5}
                                    step={0.5}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <Label className="text-lms-text-primary font-medium mb-3 block">
                                Minimum Modules: +
                            </Label>
                            <Slider
                                // value={[minModules]}
                                // onValueChange={(value) => setMinModules(value[0])}
                                max={30}
                                step={1}
                                className="max-w-xs"
                            />
                        </div>
                    </div>



                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto pt-20">
                        {courses.map(course => <CourseCard course={course} />)}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CoursesHeaderSection;