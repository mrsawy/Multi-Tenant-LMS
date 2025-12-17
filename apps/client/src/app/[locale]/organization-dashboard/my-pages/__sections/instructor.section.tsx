import {
    styleFields,
    defaultStyleProps,
    getStyleProps,
    textField,
    textareaField,
    linkField,
    colorField,
    radioField,
    selectField,
    arrayField,
    imageField
} from "./utils";

const InstructorSection = () => {
    return {
        fields: {
            ...styleFields,
            title: textField(true),
            subtitle: textareaField(true),
            backgroundColor: colorField(),
            titleColor: colorField(),
            layout: selectField([
                { label: "Grid", value: "grid" },
                { label: "List", value: "list" },
                { label: "Carousel", value: "carousel" },
                { label: "Featured + Grid", value: "featured" }
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
                { label: "Creative", value: "creative" }
            ]),
            showSocial: radioField([
                { label: "Yes", value: "yes" }, 
                { label: "No", value: "no" }
            ]),
            showStats: radioField([
                { label: "Yes", value: "yes" }, 
                { label: "No", value: "no" }
            ]),
            showBio: radioField([
                { label: "Yes", value: "yes" }, 
                { label: "No", value: "no" }
            ]),
            instructors: arrayField({
                name: textField(true),
                title: textField(true),
                image: imageField,
                bio: textareaField(true),
                courses: textField(true),
                students: textField(true),
                rating: textField(true),
                expertise: textField(true),
                twitter: linkField(),
                linkedin: linkField(),
                featured: radioField([
                    { label: "Yes", value: "yes" }, 
                    { label: "No", value: "no" }
                ])
            })
        },
        defaultProps: {
            ...defaultStyleProps,
            title: "Meet Our Expert Instructors",
            subtitle: "Learn from industry professionals with years of real-world experience",
            backgroundColor: "#ffffff",
            titleColor: "#111827",
            layout: "grid",
            columns: "3",
            cardStyle: "modern",
            showSocial: "yes",
            showStats: "yes",
            showBio: "yes",
            instructors: [
                {
                    name: "Dr. Sarah Johnson",
                    title: "Data Science Expert",
                    image: "",
                    bio: "Former Google ML engineer with 10+ years of experience in AI and machine learning. Published author and keynote speaker.",
                    courses: "12",
                    students: "45,000+",
                    rating: "4.9",
                    expertise: "Machine Learning, Python, Data Analysis",
                    twitter: "#",
                    linkedin: "#",
                    featured: "yes"
                },
                {
                    name: "Michael Chen",
                    title: "Full Stack Developer",
                    image: "",
                    bio: "Senior developer at Microsoft with expertise in web technologies. Passionate about teaching clean code principles.",
                    courses: "8",
                    students: "32,000+",
                    rating: "4.8",
                    expertise: "React, Node.js, MongoDB",
                    twitter: "#",
                    linkedin: "#",
                    featured: "no"
                },
                {
                    name: "Emily Rodriguez",
                    title: "UX/UI Design Lead",
                    image: "",
                    bio: "Award-winning designer with experience at top design agencies. Specializes in user-centered design methodologies.",
                    courses: "6",
                    students: "28,000+",
                    rating: "4.9",
                    expertise: "Figma, User Research, Prototyping",
                    twitter: "#",
                    linkedin: "#",
                    featured: "no"
                }
            ]
        },
        render: ({ title, subtitle, backgroundColor, titleColor, layout, columns, cardStyle, showSocial, showStats, showBio, instructors }: any) => {
            const cardStyles = {
                modern: "bg-white rounded-2xl shadow-lg hover:shadow-2xl",
                classic: "bg-white rounded-lg border-2 border-gray-200",
                minimal: "bg-white rounded-xl border-l-4 border-purple-600",
                creative: "bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl"
            };
            
            const featuredInstructor = instructors?.find((i: any) => i.featured === "yes");
            const regularInstructors = instructors?.filter((i: any) => i.featured !== "yes");
            
            return (
                <div className="py-20 px-6" style={{ backgroundColor }}>
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: titleColor }}>{title}</h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
                        </div>
                        
                        {layout === "featured" && featuredInstructor && (
                            <div className="mb-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                                    <div className="lg:col-span-1">
                                        <div className="w-64 h-64 rounded-2xl bg-white/20 mx-auto"
                                             style={{ backgroundImage: featuredInstructor.image ? `url(${featuredInstructor.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-2">
                                        <div className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold inline-block mb-4">
                                            Featured Instructor
                                        </div>
                                        <h3 className="text-4xl font-bold mb-2">{featuredInstructor.name}</h3>
                                        <p className="text-xl mb-4 opacity-90">{featuredInstructor.title}</p>
                                        {showBio === "yes" && (
                                            <p className="text-lg mb-6 opacity-90">{featuredInstructor.bio}</p>
                                        )}
                                        {showStats === "yes" && (
                                            <div className="grid grid-cols-3 gap-6 mb-6">
                                                <div>
                                                    <div className="text-3xl font-bold">{featuredInstructor.courses}</div>
                                                    <div className="text-sm opacity-80">Courses</div>
                                                </div>
                                                <div>
                                                    <div className="text-3xl font-bold">{featuredInstructor.students}</div>
                                                    <div className="text-sm opacity-80">Students</div>
                                                </div>
                                                <div>
                                                    <div className="text-3xl font-bold">{featuredInstructor.rating} ⭐</div>
                                                    <div className="text-sm opacity-80">Rating</div>
                                                </div>
                                            </div>
                                        )}
                                        {featuredInstructor.expertise && (
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {featuredInstructor.expertise.split(',').map((skill: string, idx: number) => (
                                                    <span key={idx} className="bg-white/20 px-4 py-2 rounded-full text-sm font-semibold">
                                                        {skill.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {showSocial === "yes" && (
                                            <div className="flex gap-4">
                                                {featuredInstructor.twitter && (
                                                    <a href={featuredInstructor.twitter} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                                                        🐦
                                                    </a>
                                                )}
                                                {featuredInstructor.linkedin && (
                                                    <a href={featuredInstructor.linkedin} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                                                        💼
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-8`}>
                            {(layout === "featured" ? regularInstructors : instructors)?.map((instructor: any, idx: number) => (
                                <div key={idx} className={`${cardStyles[cardStyle as keyof typeof cardStyles]} p-8 transition-all duration-300 hover:-translate-y-1`}>
                                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 mx-auto mb-6"
                                         style={{ backgroundImage: instructor.image ? `url(${instructor.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">{instructor.name}</h3>
                                    <p className="text-purple-600 font-semibold text-center mb-4">{instructor.title}</p>
                                    
                                    {showBio === "yes" && instructor.bio && (
                                        <p className="text-gray-600 text-center mb-6">{instructor.bio}</p>
                                    )}
                                    
                                    {showStats === "yes" && (
                                        <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-gray-200">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-900">{instructor.courses}</div>
                                                <div className="text-xs text-gray-500">Courses</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-900">{instructor.students}</div>
                                                <div className="text-xs text-gray-500">Students</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-900">{instructor.rating}</div>
                                                <div className="text-xs text-gray-500">Rating</div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {instructor.expertise && (
                                        <div className="flex flex-wrap gap-2 mb-6 justify-center">
                                            {instructor.expertise.split(',').slice(0, 3).map((skill: string, sIdx: number) => (
                                                <span key={sIdx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                    {skill.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {showSocial === "yes" && (
                                        <div className="flex gap-3 justify-center">
                                            {instructor.twitter && (
                                                <a href={instructor.twitter} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                                                    🐦
                                                </a>
                                            )}
                                            {instructor.linkedin && (
                                                <a href={instructor.linkedin} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                                                    💼
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }
    }
};

export default InstructorSection;