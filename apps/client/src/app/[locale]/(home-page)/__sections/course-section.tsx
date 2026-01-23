import { Button } from "@/components/atoms/button";
import { BookOpen } from "lucide-react";
import CourseCard from "../../../../components/organs/course-card";
import { getFeaturedCourses } from "@/lib/actions/courses/getFeaturedCourses.action";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import CategoryFilter from "./__components/category-filter";

interface CoursesSectionProps {
    searchParams?: Promise<{ category?: string }>;
}

const CoursesSection = async ({ searchParams }: CoursesSectionProps) => {
    const t = await getTranslations('CoursesSection');
    const params = await searchParams;
    const allText = t("all");
    const selectedCategory = params?.category || allText;

    const courses = await getFeaturedCourses({ limit: 9 });
    console.dir({ courses }, { depth: null });

    const allCategories = [allText, ...new Set(courses.flatMap((course) => course.categories).filter((category) => !!category).map((category) => category?.name))].slice(0, 7);

    // Filter courses based on selected category
    const filteredCourses = selectedCategory === allText
        ? courses
        : courses.filter((course) =>
            course.categories?.some((category) => category?.name === selectedCategory)
        );

    return (
        <section className="py-24 bg-section-bg">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                        {t('title.featured')}{" "}
                        <span className="xbg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text xtext-transparent ml-3">
                            {t('title.courses')}
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                        {t('description')}
                    </p>

                    {/* Category Filter */}
                    <CategoryFilter categories={allCategories} />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {filteredCourses.length > 0 ? (
                        filteredCourses.map((course) => (
                            <CourseCard key={course._id?.toString()} course={course} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <p className="text-muted-foreground text-lg">
                                {t('noCoursesFound')}
                            </p>
                        </div>
                    )}
                </div>

                {/* View All Courses */}
                <div className="text-center mt-12">
                    <Link href="/courses">
                        <Button
                            size="lg"
                            variant="outline"
                            effect="expandIcon"
                            icon={<BookOpen />}
                            iconPlacement="left"
                        >
                            {t('viewAllButton')}
                        </Button>
                    </Link>

                </div>
            </div>
        </section>
    );
};

export default CoursesSection;