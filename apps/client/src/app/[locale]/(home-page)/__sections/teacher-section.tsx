import { Button } from "@/components/atoms/button";
import { Star, Users, BookOpen, Award } from "lucide-react";
import { getFeaturedInstructors } from "@/lib/actions/instructors/getFeaturedInstructors.action";
import InstructorCard4 from "../instructors/__components/instructor-card-4";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const TeachersSection = async () => {
    const t = await getTranslations('TeachersSection');
    const teachers = await getFeaturedInstructors({ limit: 9 });

    return (
        <section className="py-24 bg-section-bg">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                        {t('title.explore')}{" "}
                        <span className="xbg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text xtext-transparent ml-3">
                            {t('title.teachers')}
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        {t('description')}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {teachers.map((teacher) => (
                        <InstructorCard4 key={teacher._id} instructor={teacher} />
                    ))}
                </div>

                {/* View All Teachers */}
                <div className="text-center mt-12">
                    <Link href="/instructors"                        >
                        <Button
                            size="lg"
                            // className="bg-brand-purple hover:bg-brand-purple/90 text-white px-8"
                            variant="outline"
                            effect="expandIcon"
                            icon={<Award />}
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

export default TeachersSection;