import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
// import { Progress } from "@/components/atoms/progress";
import { Separator } from "@/components/atoms/separator";
import { ArrowLeft, Star, Clock, Users, BookOpen, Award, CheckCircle, Play, Download, Globe, Smartphone } from "lucide-react";
import { Link } from "@/i18n/navigation";

const SingleCourse = () => {

    // Mock course data - in real app this would come from API
    const course = {
        id: 1,
        title: "Complete React & TypeScript Masterclass",
        subtitle: "Build modern, scalable web applications with React 18, TypeScript, and advanced patterns",
        instructor: {
            name: "Sarah Johnson",
            title: "Senior Software Engineer at Google",
            avatar: "/placeholder.svg",
            rating: 4.9,
            students: 125000,
            courses: 12
        },
        price: 89.99,
        originalPrice: 199.99,
        rating: 4.8,
        reviewCount: 15420,
        studentCount: 87350,
        duration: "24.5 hours",
        modules: 18,
        level: "Intermediate",
        language: "English",
        lastUpdated: "March 2024",
        features: [
            "24.5 hours of on-demand video",
            "45 coding exercises",
            "30 articles and resources",
            "Certificate of completion",
            "Lifetime access",
            "Mobile and desktop access",
            "30-day money-back guarantee"
        ],
        description: "Master React and TypeScript in this comprehensive course. Learn modern React patterns, hooks, context, testing, and build real-world projects that will land you your dream job.",
        whatYouLearn: [
            "Build modern React applications with TypeScript",
            "Master React Hooks and advanced patterns",
            "Implement state management with Context and Redux",
            "Write comprehensive tests with Jest and Testing Library",
            "Deploy applications to production",
            "Optimize performance and bundle size"
        ],
        curriculum: [
            {
                title: "Getting Started with React & TypeScript",
                lessons: 8,
                duration: "2h 15m",
                lessons_detail: [
                    "Introduction to React and TypeScript",
                    "Setting up the development environment",
                    "Creating your first React TypeScript component",
                    "Understanding JSX with TypeScript"
                ]
            },
            {
                title: "React Hooks Mastery",
                lessons: 12,
                duration: "3h 45m",
                lessons_detail: [
                    "useState and useEffect deep dive",
                    "Custom hooks patterns",
                    "useContext and useReducer",
                    "Performance optimization with useMemo and useCallback"
                ]
            },
            {
                title: "State Management",
                lessons: 10,
                duration: "4h 20m",
                lessons_detail: [
                    "Context API patterns",
                    "Redux Toolkit integration",
                    "Zustand for simple state management",
                    "Server state with React Query"
                ]
            },
            {
                title: "Testing React Applications",
                lessons: 8,
                duration: "2h 45m",
                lessons_detail: [
                    "Jest fundamentals",
                    "React Testing Library best practices",
                    "Testing hooks and components",
                    "Integration testing strategies"
                ]
            }
        ],
        testimonials: [
            {
                name: "Alex Chen",
                role: "Frontend Developer",
                avatar: "/placeholder.svg",
                rating: 5,
                text: "This course completely transformed my React skills. The TypeScript integration is explained perfectly, and the projects are industry-relevant."
            },
            {
                name: "Maria Rodriguez",
                role: "Full Stack Developer",
                avatar: "/placeholder.svg",
                rating: 5,
                text: "Sarah's teaching style is exceptional. I went from React beginner to landing a senior position at a tech startup."
            },
            {
                name: "David Kim",
                role: "Software Engineer",
                avatar: "/placeholder.svg",
                rating: 5,
                text: "The most comprehensive React course I've taken. The testing section alone is worth the price."
            }
        ]
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="border-b border-border bg-card  pt-24">
                <div className="container mx-auto px-4 py-4">
                    <Link href="/courses" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Courses
                    </Link>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Course Header */}
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary">{course.level}</Badge>
                                <Badge variant="outline">Bestseller</Badge>
                                <Badge variant="outline">Updated {course.lastUpdated}</Badge>
                            </div>

                            <h1 className="text-4xl font-bold tracking-tight">{course.title}</h1>
                            <p className="text-xl text-muted-foreground">{course.subtitle}</p>

                            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-primary text-primary" />
                                    <span className="font-medium text-foreground">{course.rating}</span>
                                    <span>({course.reviewCount.toLocaleString()} reviews)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    <span>{course.studentCount.toLocaleString()} students</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{course.duration}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <BookOpen className="h-4 w-4" />
                                    <span>{course.modules} modules</span>
                                </div>
                            </div>
                        </div>

                        {/* Instructor */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Instructor</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={course.instructor.avatar} />
                                        <AvatarFallback>{course.instructor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold">{course.instructor.name}</h3>
                                        <p className="text-muted-foreground">{course.instructor.title}</p>
                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-primary text-primary" />
                                                <span>{course.instructor.rating} rating</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                <span>{course.instructor.students.toLocaleString()} students</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <BookOpen className="h-4 w-4" />
                                                <span>{course.instructor.courses} courses</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* What You'll Learn */}
                        <Card>
                            <CardHeader>
                                <CardTitle>What you'll learn</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-3">
                                    {course.whatYouLearn.map((item, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Course Content */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Content</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {course.curriculum.length} sections • {course.curriculum.reduce((acc, curr) => acc + curr.lessons, 0)} lectures • {course.duration} total length
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {course.curriculum.map((section, index) => (
                                    <div key={index} className="border border-border rounded-lg">
                                        <div className="p-4 bg-muted/30">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">{section.title}</h4>
                                                <div className="text-sm text-muted-foreground">
                                                    {section.lessons} lessons • {section.duration}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 pt-0 space-y-2">
                                            {section.lessons_detail.map((lesson, lessonIndex) => (
                                                <div key={lessonIndex} className="flex items-center gap-2 text-sm py-1">
                                                    <Play className="h-4 w-4 text-muted-foreground" />
                                                    <span>{lesson}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Student Reviews */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Student Reviews</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
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
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Course Preview Card */}
                        <Card className="sticky top-8">
                            <CardContent className="p-0">
                                {/* Video Preview */}
                                <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                                    <Button size="lg" className="h-16 w-16 rounded-full">
                                        <Play className="h-6 w-6 ml-1" />
                                    </Button>
                                </div>

                                <div className="p-6 space-y-4">
                                    {/* Pricing */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl font-bold">${course.price}</span>
                                            <span className="text-lg text-muted-foreground line-through">${course.originalPrice}</span>
                                            <Badge variant="destructive">55% off</Badge>
                                        </div>
                                        <p className="text-sm text-destructive font-medium">2 days left at this price!</p>
                                    </div>

                                    {/* CTA Buttons */}
                                    <div className="space-y-3">
                                        <Button size="lg" className="w-full">
                                            Enroll Now
                                        </Button>
                                        <Button variant="outline" size="lg" className="w-full">
                                            Add to Wishlist
                                        </Button>
                                    </div>

                                    <p className="text-center text-sm text-muted-foreground">
                                        30-day money-back guarantee
                                    </p>

                                    <Separator />

                                    {/* Course Includes */}
                                    <div className="space-y-3">
                                        <h4 className="font-medium">This course includes:</h4>
                                        <div className="space-y-2">
                                            {course.features.map((feature, index) => (
                                                <div key={index} className="flex items-center gap-2 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-primary" />
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Course Info */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Language:</span>
                                            <span>{course.language}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Level:</span>
                                            <span>{course.level}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Last updated:</span>
                                            <span>{course.lastUpdated}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Progress Teaser */}
                        {/* <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-primary" />
                                    Track Your Progress
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Course Progress</span>
                                        <span>0%</span>
                                    </div>
                                    <Progress value={0} className="h-2" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Get personalized progress tracking, earn certificates, and unlock achievements as you learn.
                                </p>
                            </CardContent>
                        </Card> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleCourse;