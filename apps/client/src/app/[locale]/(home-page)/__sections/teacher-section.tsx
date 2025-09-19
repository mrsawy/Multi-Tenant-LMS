"use client"
import { Card, CardContent } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Star, Users, BookOpen, Award } from "lucide-react";
import Image from "next/image";
// import teacher1 from "@/assets/teacher-1.png";
// import teacher2 from "@/assets/teacher-2.png";
// import teacher3 from "@/assets/teacher-3.png";

const TeachersSection = () => {
    const teachers = [
        {
            id: 1,
            name: "Dr. Sarah Mitchell",
            specialty: "Data Science & AI",
            image: "/images/t1.png",
            rating: 4.9,
            students: 12500,
            courses: 8,
            experience: "10+ years",
            badges: ["AI Expert", "Top Instructor"],
            bio: "Former Google AI researcher with expertise in machine learning and data analytics. Passionate about making complex concepts accessible."
        },
        {
            id: 2,
            name: "Prof. Marcus Rodriguez",
            specialty: "Web Development",
            image: "/images/t2.png",
            rating: 4.8,
            students: 8900,
            courses: 12,
            experience: "8+ years",
            badges: ["Full Stack", "React Specialist"],
            bio: "Senior software engineer turned educator, specializing in modern web technologies and scalable application development."
        },
        {
            id: 3,
            name: "Dr. Amara Okafor",
            specialty: "UX/UI Design",
            image: "/images/t3.png",
            rating: 4.9,
            students: 15200,
            courses: 6,
            experience: "12+ years",
            badges: ["Design Lead", "UX Certified"],
            bio: "Award-winning designer with experience at top tech companies. Focuses on user-centered design principles and design thinking."
        }
    ];

    return (
        <section className="py-24 bg-section-bg">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                        Explore
                        <span className="xbg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text xtext-transparent ml-3">
                            Teachers
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Learn from industry experts and thought leaders who bring real-world experience
                        and cutting-edge knowledge to every course.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {teachers.map((teacher) => (
                        <Card key={teacher.id} className="bg-section-card border-border/50 hover:border-brand-purple/30 transition-all duration-300 hover:shadow-lg group py-0">
                            <CardContent className="p-6">
                                {/* Teacher Image */}
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden ring-4 ring-brand-purple/20 group-hover:ring-brand-purple/40 transition-all duration-300">
                                        <img
                                            src={teacher.image}
                                            alt={teacher.name}
                                            className="w-full h-full object-cover"
                                        //   fill
                                        />
                                    </div>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                                        <Badge className="bg-brand-purple text-white text-xs px-2 py-1 bg-purple-400 transition-all duration-300 hover:ring-brand-purple/40 hover:shadow-lg group-hover:ring-brand-purple/40 group-hover:ring-brand-purple/40  group-hover:ring-brand-purple/4">
                                            {teacher.experience}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Teacher Info */}
                                <div className="text-center mb-4">
                                    <h3 className="text-xl font-bold text-foreground mb-1">{teacher.name}</h3>
                                    <p className="text-brand-purple font-medium mb-3">{teacher.specialty}</p>

                                    {/* Stats */}
                                    <div className="flex justify-center gap-4 mb-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                            <span>{teacher.rating}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            <span>{teacher.students.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="w-4 h-4" />
                                            <span>{teacher.courses}</span>
                                        </div>
                                    </div>

                                    {/* Badges */}
                                    <div className="flex justify-center gap-2 mb-4">
                                        {teacher.badges.map((badge) => (
                                            <Badge key={badge} variant="secondary" className="text-xs bg-brand-purple/10 text-brand-purple border-brand-purple/20">
                                                {badge}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Bio */}
                                <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                                    {teacher.bio}
                                </p>

                                {/* Action Button */}
                                <Button
                                    variant="outline"
                                    className="w-full border-brand-purple/30 text-brand-purple hover:bg-brand-purple hover:text-white transition-all duration-300"
                                >
                                    View Profile
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* View All Teachers */}
                <div className="text-center mt-12">
                    <Button
                        size="lg"
                        className="bg-brand-purple hover:bg-brand-purple/90 text-white px-8"
                    >
                        <Award className="w-5 h-5 mr-2" />
                        View All Teachers
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default TeachersSection;