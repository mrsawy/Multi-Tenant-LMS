
import {
    styleFields,
    defaultStyleProps,
    getStyleProps,
    textField,
    textareaField,
    linkField,
    colorField,
    numberField,
    radioField,
    selectField,
    arrayField,
    imageField
} from "./utils";

const CourseShowcase = () => {
    return {
        fields: {
            ...styleFields,
            title: textField(true),
            subtitle: textareaField(true),
            backgroundColor: colorField(),
            titleColor: colorField(),
            viewAllText: textField(true),
            showFilters: radioField([
                { label: "Yes", value: "yes" }, 
                { label: "No", value: "no" }
            ]),
            layout: selectField([
                { label: "Grid", value: "grid" },
                { label: "Carousel", value: "carousel" },
                { label: "List", value: "list" }
            ]),
            columns: selectField([
                { label: "2 Columns", value: "2" },
                { label: "3 Columns", value: "3" },
                { label: "4 Columns", value: "4" }
            ]),
            cardStyle: selectField([
                { label: "Modern", value: "modern" },
                { label: "Classic", value: "classic" },
                { label: "Minimal", value: "minimal" },
                { label: "Bold", value: "bold" }
            ]),
            showBadges: radioField([
                { label: "Yes", value: "yes" }, 
                { label: "No", value: "no" }
            ]),
            showDuration: radioField([
                { label: "Yes", value: "yes" }, 
                { label: "No", value: "no" }
            ]),
            showLevel: radioField([
                { label: "Yes", value: "yes" }, 
                { label: "No", value: "no" }
            ]),
            courses: arrayField({
                image: imageField,
                title: textField(true),
                instructor: textField(true),
                price: textField(true),
                oldPrice: textField(true),
                rating: textField(true),
                students: textField(true),
                duration: textField(true),
                level: textField(true),
                badge: textField(true),
                category: textField(true),
                link: linkField(),
                learnMoreText: textField(true)
            })
        },
        defaultProps: {
            ...defaultStyleProps,
            title: "Popular Courses",
            subtitle: "Explore our most popular courses and start learning today",
            viewAllText: "View All Courses",
            backgroundColor: "#ffffff",
            titleColor: "#111827",
            showFilters: "yes",
            layout: "grid",
            columns: "3",
            cardStyle: "modern",
            showBadges: "yes",
            showDuration: "yes",
            showLevel: "yes",
            courses: [
                { 
                    image: "", 
                    title: "Web Development Bootcamp", 
                    instructor: "John Doe", 
                    price: "$49", 
                    oldPrice: "$99",
                    rating: "4.8", 
                    students: "1,234",
                    duration: "40 hours",
                    level: "Beginner",
                    badge: "Bestseller",
                    category: "Development",
                    link: "#",
                    learnMoreText: "Learn More"
                },
                { 
                    image: "", 
                    title: "Data Science Fundamentals", 
                    instructor: "Jane Smith", 
                    price: "$59", 
                    oldPrice: "$129",
                    rating: "4.9", 
                    students: "2,100",
                    duration: "35 hours",
                    level: "Intermediate",
                    badge: "New",
                    category: "Data Science",
                    link: "#",
                    learnMoreText: "Learn More"
                },
                { 
                    image: "", 
                    title: "UI/UX Design Masterclass", 
                    instructor: "Mike Johnson", 
                    price: "$79", 
                    oldPrice: "",
                    rating: "4.7", 
                    students: "890",
                    duration: "28 hours",
                    level: "Advanced",
                    badge: "",
                    category: "Design",
                    link: "#",
                    learnMoreText: "Learn More"
                }
            ]
        },
        render: ({ title, subtitle, viewAllText, backgroundColor, titleColor, showFilters, layout, columns, cardStyle, showBadges, showDuration, showLevel, courses, ...props }: any) => {
            const styleProps = getStyleProps(props);
            
            const categories = Array.from(new Set(courses?.map((c: any) => c.category).filter(Boolean)));
            
            const cardStyles = {
                modern: "rounded-2xl overflow-hidden border border-gray-100",
                classic: "rounded-lg overflow-hidden shadow-md",
                minimal: "rounded-xl overflow-hidden border-2 border-gray-200",
                bold: "rounded-2xl overflow-hidden shadow-xl border-4 border-purple-500"
            };
            
            return (
                <div className="py-20 px-6" style={{ ...styleProps, backgroundColor }}>
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: titleColor }}>{title}</h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
                        </div>
                        
                        {showFilters === "yes" && categories.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-3 mb-12">
                                <button className="px-6 py-2 rounded-full bg-purple-600 text-white font-semibold">All</button>
                                {categories.map((cat: any, idx: number) => (
                                    <button key={idx} className="px-6 py-2 rounded-full bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-8`}>
                            {courses?.map((course: any, idx: number) => (
                                <a key={idx} href={course.link || "#"} className={`${cardStyles[cardStyle as keyof typeof cardStyles]} hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer`}>
                                    <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden" style={{ backgroundImage: course.image ? `url(${course.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                        {showBadges === "yes" && course.badge && course.badge.props.value && (
                                            <div className="absolute top-4 left-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                                                {course.badge}
                                            </div>
                                        )}
                                        {showDuration === "yes" && course.duration && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                                                {course.duration}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            {course.category && (
                                                <span className="text-purple-600 text-sm font-semibold uppercase tracking-wide">{course.category}</span>
                                            )}
                                            {showLevel === "yes" && course.level && (
                                                <span className="text-gray-500 text-sm">{course.level}</span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">{course.title}</h3>
                                        <p className="text-gray-600 mb-4 text-sm">by {course.instructor}</p>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-yellow-500">⭐</span>
                                                <span className="font-bold text-gray-900">{course.rating}</span>
                                                <span className="text-gray-500 text-sm">({course.students})</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                            <div className="flex items-center gap-2">
                                                <span className="text-3xl font-bold text-purple-600">{course.price}</span>
                                                {course.oldPrice && (
                                                    <span className="text-lg text-gray-400 line-through">{course.oldPrice}</span>
                                                )}
                                            </div>
                                            <span className="text-purple-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                                {course.learnMoreText || "Learn More"} <span>→</span>
                                            </span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                        
                        <div className="text-center mt-12">
                            <button className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors">
                                {viewAllText}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
    }
};

export default CourseShowcase;