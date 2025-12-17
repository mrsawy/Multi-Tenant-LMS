import {
    styleFields,
    defaultStyleProps,
    getStyleProps,
    textField,
    textareaField,
    colorFields,
    selectField,
    arrayField,
    imageField,
    animationField
} from "./utils";

export const TeamSection = () => {
    return {
        fields: {
            ...styleFields,
            title: textField(true),
            subtitle: textareaField(true),
            ...colorFields,
            layout: selectField([
                { label: "Grid 2 Columns", value: "grid-2" },
                { label: "Grid 3 Columns", value: "grid-3" },
                { label: "Grid 4 Columns", value: "grid-4" },
                { label: "Carousel", value: "carousel" },
            ]),
            cardStyle: selectField([
                { label: "Modern", value: "modern" },
                { label: "Minimal", value: "minimal" },
                { label: "Elevated", value: "elevated" },
                { label: "Bordered", value: "bordered" },
            ]),
            animation: animationField,
            members: arrayField({
                name: textField(true),
                role: textField(true),
                bio: textareaField(true),
                image: imageField,
                linkedin: textField(false),
                twitter: textField(false),
            }),
        },
        defaultProps: {
            ...defaultStyleProps,
            title: "Meet Our Team",
            subtitle: "Passionate educators and experts dedicated to your success",
            backgroundColor: "#f9fafb",
            textColor: "#1f2937",
            layout: "grid-3",
            cardStyle: "modern",
            animation: "fade",
            members: [
                {
                    name: "Sarah Johnson",
                    role: "Lead Instructor",
                    bio: "10+ years of experience in web development and teaching",
                    image: "",
                    linkedin: "#",
                    twitter: "#"
                },
                {
                    name: "Michael Chen",
                    role: "Data Science Expert",
                    bio: "Former Google engineer specializing in machine learning",
                    image: "",
                    linkedin: "#",
                    twitter: "#"
                },
                {
                    name: "Emily Rodriguez",
                    role: "UX/UI Designer",
                    bio: "Award-winning designer with a passion for user experience",
                    image: "",
                    linkedin: "#",
                    twitter: "#"
                },
                {
                    name: "David Kim",
                    role: "Backend Architect",
                    bio: "Specialized in scalable systems and cloud infrastructure",
                    image: "",
                    linkedin: "#",
                    twitter: "#"
                },
                {
                    name: "Lisa Anderson",
                    role: "Mobile Developer",
                    bio: "Expert in iOS and Android development",
                    image: "",
                    linkedin: "#",
                    twitter: "#"
                },
                {
                    name: "James Wilson",
                    role: "DevOps Engineer",
                    bio: "Passionate about automation and continuous delivery",
                    image: "",
                    linkedin: "#",
                    twitter: "#"
                }
            ]
        },
        render: ({ 
            title, 
            subtitle, 
            backgroundColor, 
            textColor, 
            layout,
            cardStyle,
            animation,
            members, 
            ...props 
        }: any) => {
            const styleProps = getStyleProps(props);
            
            const gridClasses = {
                "grid-2": "grid-cols-1 md:grid-cols-2",
                "grid-3": "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
                "grid-4": "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
                "carousel": "flex overflow-x-auto gap-6 pb-4",
            };

            const animationClass = animation === "fade" ? "animate-fadeIn" : animation === "slide" ? "animate-slideUp" : "";

            const renderMemberCard = (member: any, idx: number) => {
                if (cardStyle === "modern") {
                    return (
                        <div 
                            key={idx}
                            className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${animationClass} ${layout === "carousel" ? "flex-shrink-0 w-80" : ""}`}
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="relative h-64 bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                {member.image ? (
                                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-8xl text-white/30">👤</div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-2xl font-bold mb-1" style={{ color: textColor }}>
                                    {member.name}
                                </h3>
                                <p className="text-purple-600 font-semibold mb-3">{member.role}</p>
                                <p className="opacity-70 mb-4" style={{ color: textColor }}>
                                    {member.bio}
                                </p>
                                <div className="flex gap-3">
                                    {member.linkedin && (
                                        <a href={member.linkedin} className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                                            in
                                        </a>
                                    )}
                                    {member.twitter && (
                                        <a href={member.twitter} className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white hover:bg-sky-600 transition-colors">
                                            𝕏
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                }

                if (cardStyle === "minimal") {
                    return (
                        <div 
                            key={idx}
                            className={`text-center ${animationClass} ${layout === "carousel" ? "flex-shrink-0 w-80" : ""}`}
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden border-4 border-purple-500 shadow-xl">
                                {member.image ? (
                                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-6xl text-white/30">
                                        👤
                                    </div>
                                )}
                            </div>
                            <h3 className="text-2xl font-bold mb-1" style={{ color: textColor }}>
                                {member.name}
                            </h3>
                            <p className="text-purple-600 font-semibold mb-3">{member.role}</p>
                            <p className="opacity-70 mb-4" style={{ color: textColor }}>
                                {member.bio}
                            </p>
                            <div className="flex gap-3 justify-center">
                                {member.linkedin && (
                                    <a href={member.linkedin} className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                                        in
                                    </a>
                                )}
                                {member.twitter && (
                                    <a href={member.twitter} className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white hover:bg-sky-600 transition-colors">
                                        𝕏
                                    </a>
                                )}
                            </div>
                        </div>
                    );
                }

                if (cardStyle === "elevated") {
                    return (
                        <div 
                            key={idx}
                            className={`bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${animationClass} ${layout === "carousel" ? "flex-shrink-0 w-80" : ""}`}
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-purple-200">
                                    {member.image ? (
                                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-3xl text-white/30">
                                            👤
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-1" style={{ color: textColor }}>
                                        {member.name}
                                    </h3>
                                    <p className="text-purple-600 font-semibold text-sm">{member.role}</p>
                                </div>
                            </div>
                            <p className="opacity-70 mb-4" style={{ color: textColor }}>
                                {member.bio}
                            </p>
                            <div className="flex gap-3">
                                {member.linkedin && (
                                    <a href={member.linkedin} className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm hover:bg-blue-700 transition-colors">
                                        in
                                    </a>
                                )}
                                {member.twitter && (
                                    <a href={member.twitter} className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white text-sm hover:bg-sky-600 transition-colors">
                                        𝕏
                                    </a>
                                )}
                            </div>
                        </div>
                    );
                }

                // Bordered style
                return (
                    <div 
                        key={idx}
                        className={`bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-purple-500 transition-all duration-300 hover:-translate-y-2 ${animationClass} ${layout === "carousel" ? "flex-shrink-0 w-80" : ""}`}
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className="relative w-32 h-32 mx-auto mb-4 rounded-2xl overflow-hidden">
                            {member.image ? (
                                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-5xl text-white/30">
                                    👤
                                </div>
                            )}
                        </div>
                        <h3 className="text-xl font-bold mb-1 text-center" style={{ color: textColor }}>
                            {member.name}
                        </h3>
                        <p className="text-purple-600 font-semibold text-center mb-3">{member.role}</p>
                        <p className="opacity-70 text-center mb-4" style={{ color: textColor }}>
                            {member.bio}
                        </p>
                        <div className="flex gap-3 justify-center">
                            {member.linkedin && (
                                <a href={member.linkedin} className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                                    in
                                </a>
                            )}
                            {member.twitter && (
                                <a href={member.twitter} className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center text-white hover:bg-sky-600 transition-colors">
                                    𝕏
                                </a>
                            )}
                        </div>
                    </div>
                );
            };

            return (
                <div className="py-20 px-6" style={{ ...styleProps, backgroundColor }}>
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: textColor }}>
                                {title}
                            </h2>
                            <p className="text-xl opacity-80 max-w-3xl mx-auto" style={{ color: textColor }}>
                                {subtitle}
                            </p>
                        </div>
                        <div className={layout === "carousel" ? gridClasses[layout] : `grid ${gridClasses[layout as keyof typeof gridClasses]} gap-8`}>
                            {members?.map((member: any, idx: number) => renderMemberCard(member, idx))}
                        </div>
                    </div>
                </div>
            );
        }
    };
};

export default TeamSection;
