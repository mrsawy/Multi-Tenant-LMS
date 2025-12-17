"use client"
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Clock, Users, Star, Play, BookOpen, TrendingUp } from "lucide-react";
import { Paginated } from "@/lib/types/Paginated";
import { ICourse } from "@/lib/types/course/course.interface";
import CourseCard from "../../courses/__components/course-card";


const CoursesSection = ({ courses }: { courses: Paginated<ICourse> }) => {


    const categories = ["All", "Web Development", "Data Science", "Design", "Cloud Computing", "Marketing", "Blockchain"];

    const getLevelColor = (level: string) => {
        switch (level) {
            case "Beginner": return "bg-green-100 text-green-700 border-green-200";
            case "Intermediate": return "bg-blue-100 text-blue-700 border-blue-200";
            case "Advanced": return "bg-purple-100 text-purple-700 border-purple-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <section className="  ">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                        Featured
                        <span className="xbg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text xtext-transparent ml-3">
                            Courses
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                        Discover our most popular courses designed by industry experts to advance your skills
                        and accelerate your career growth.
                    </p>

                    {/* Category Filter */}
                    <div className="flex flex-wrap justify-center gap-3">
                        {categories.map((category) => (
                            <Button
                                key={category}
                                variant={category === "All" ? "default" : "outline"}
                                size="sm"
                                className={"border-border hover:border-brand-purple/30 hover:bg-brand-purple/5"}
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {courses.docs.map((course) => (
                        <CourseCard course={course} />
                    ))}
                </div>

                {/* View All Courses */}
                <div className="text-center mt-12">
                    <Button
                        size="lg"
                        variant="outline"
                        className="border-brand-purple/30 text-brand-purple hover:bg-brand-purple hover: transition-all duration-300 px-8"
                    >
                        <BookOpen className="w-5 h-5 mr-2" />
                        View All Courses
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default CoursesSection;